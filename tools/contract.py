import os
import sys
import json
import requests
from pprint import pprint
import subprocess

import ethereum.abi as eabi
from overlog import ovlg, ovlocal

from store import *

ovlg().trace_except()

MainStore = Store()

def obj_hook(d):
	for k in d.keys():
		v = d[k]
		if isinstance(v, unicode):
			d[k] = str(v)

	return d

RegistrarABI = json.loads('''[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"name","outputs":[{"name":"o_name","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"content","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"reserve","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"subRegistrar","outputs":[{"name":"o_subRegistrar","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_registrar","type":"address"}],"name":"setSubRegistrar","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"Registrar","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_a","type":"address"},{"name":"_primary","type":"bool"}],"name":"setAddress","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_content","type":"bytes32"}],"name":"setContent","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"disown","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"register","outputs":[{"name":"","type":"address"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"}],"name":"Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"}],"name":"PrimaryChanged","type":"event"}]''', object_hook=obj_hook)
RegistrarAddr = "0xc6d9d2cd449a754c494264e1809c50e34d64562b"

transl = eabi.ContractTranslator(RegistrarABI)

class EthRpc(object):
	def __init__(self, host, port):
		self.host = host
		self.port = port


	def _call(self, method, params=None, _id=0):
		if params is None:
			params = []
		data = json.dumps({
			'jsonrpc': '2.0',
			'method': method,
			'params': params,
			'id': _id
		})
		response = None
		try:
			response = requests.post("http://{}:{}".format(self.host, self.port), data=data).json()
			return response['result']
		except:
			print response
			raise

	def sendTransaction(self, **kwargs):
		for k in kwargs.keys():
			if k.endswith('_'):
				v = kwargs[k]
				del kwargs[k]
				kwargs[k.rstrip('_')] = v

		ovlocal()

		return self._call('eth_sendTransaction', [kwargs])

	def accounts(self):
		return self._call('eth_accounts')

eth = EthRpc(*MainStore.data['geth_conn'])
prim_acc = eth.accounts()[1]
con_name = 'Roboth'

def compile_internal(src, rpc=True):
	if isinstance(src, file):
		src = src.read()

	if rpc:
		res = eth._call('eth_compileSolidity', [src])
		return res

	else:
		p = subprocess.Popen("plink root@guardian docker exec -i thirsty_lovelace solc --combined-json 'binary,json-abi'", shell=True,
						stdin=subprocess.PIPE,
						stdout=subprocess.PIPE,
						stderr=subprocess.PIPE)
		stdout, stderr = p.communicate(src)
		#print 'OET'
		#print stdout
		print 'ERR'
		print stderr
		return json.loads(stdout)


def abi_to_ascii(abi):
	'ContractTranslator doesnt like method names in unicode'
	for i in abi:
		for fn in i['inputs'] + i.get('outputs', []):
			fn['name'] = fn['name'].encode()
			if 'type' in fn: fn['type'] = fn['type'].encode()
		if 'name' in i: i['name'] = i['name'].encode()
		if 'type' in i: i['type'] = i['type'].encode()
	return abi


def compile():
	compiled = compile_internal(open('../app/sol/{}.sol'.format(con_name)))
	ovlg().data('heres the compiled stuff', compiled)

	code = compiled[con_name]['code']
	abi = abi_to_ascii(compiled[con_name]['info']['abiDefinition'])

	ovlg().data(code, abi)
	print '---- ABI ---- %< ----'
	print json.dumps(abi, indent=None)
	return ContractInfo(abi=abi, code=code, name=con_name)


def deploy():
	ci = compile()

	# actual deployment
	res = eth.sendTransaction(data=ci.code, from_=prim_acc, gas=1800000)
	ovlg().data( deployed_at=res )
	if res.startswith('0x'): res = res[2:]
	ci.addr = res

	# ok now deployed, save it
	ci.register_with_store(MainStore)

	print '---- ADDR ---- %< ----'
	print ci.addr

	register(con_name, ci.addr)

	print 'Registered as ', con_name
	return ci


def register(con_name, addr):
	# reserve the name first using primary account
	data = transl.encode('reserve', [con_name]).encode('hex')
	eth.sendTransaction(data=data, from_=prim_acc, to=RegistrarAddr)

	# set address to latest deployment
	data = transl.encode('setAddress', [con_name, addr, 1]).encode('hex')
	eth.sendTransaction(data=data, from_=prim_acc, to=RegistrarAddr)


def add_testdata(ci):
	contract_api = eabi.ContractTranslator(ci.abi)
	gas = 400*1000

	data = contract_api.encode('createJob', ['petty']).encode('hex')
	eth.sendTransaction(data=data, from_=prim_acc, to=ci.addr, gas=gas, value=web3.toWei(0.1))

	data = contract_api.encode('createJob', ['Hello Kitty']).encode('hex')
	eth.sendTransaction(data=data, from_=eth.accounts()[0], to=ci.addr, gas=gas, value=web3.toWei(0.5))


def write_abi(ci):
	path = '../app/client/lib/compatibility/{}.abi.js'.format(ci.name)
	with open(path, 'wc') as outf:
		outf.write('window.{}ABI = {};'.format(ci.name, json.dumps(ci.abi)))


try:
	if True:
		ci = MainStore.last_ci()
	else:
		ci = deploy()
		write_abi(ci)
	add_testdata(ci)
finally:
	MainStore.save()
