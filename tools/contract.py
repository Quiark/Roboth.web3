import os
import sys
import json
import time
import requests
from pprint import pprint
import subprocess
import argparse
from os.path import join

# Required
# https://github.com/ethereum/pyethereum
import ethereum.abi as eabi

# This is my Overlog library for sending logs/debugging output to a browser
# https://github.com/Quiark/overlog
# feel free to either .) Install it  or .) Just delete these calls
from overlog import ovlg, ovlocal

from store import *

#ovlg().trace_except()

MainStore = Store()

def obj_hook(d):
	"""Contract translator doesnt like Unicode strings as identifiers"""
	for k in d.keys():
		v = d[k]
		if isinstance(v, unicode):
			d[k] = str(v)

	return d


def addr_noprefix(a):
	if a.startswith('0x'): return a[2:]
	else: return a


def no0_suffix(s):
	return s.rstrip('\x00')

# configuration globals
RegistrarABI = json.loads('''[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"name","outputs":[{"name":"o_name","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"content","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"reserve","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"subRegistrar","outputs":[{"name":"o_subRegistrar","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_registrar","type":"address"}],"name":"setSubRegistrar","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"Registrar","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_a","type":"address"},{"name":"_primary","type":"bool"}],"name":"setAddress","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_content","type":"bytes32"}],"name":"setContent","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"disown","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"register","outputs":[{"name":"","type":"address"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"}],"name":"Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"}],"name":"PrimaryChanged","type":"event"}]''', object_hook=obj_hook)
RegistrarAddr = "0x7baae5f7546381f59710b922f55110d9f8704b1d"
Solc = r'..\AlethZero\Release\solc.exe'
CompileOverRpc = False
RpcHost = ('localhost', 8545)
ConName = 'Roboth'

if True:
	RegistrarAddr = '0x66548b4ad6d6be74bc2dbb53ef8c4df0f7b671b3'

# for Registrar
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
		ovlg().data('RPC _call', method=method, params=params, data=data)
		try:
			response = requests.post("http://{}:{}".format(self.host, self.port), data=data).json()
			return response['result']
		except:
			ovlocal()
			print response
			raise

	def sendTransaction(self, **kwargs):
		for k in kwargs.keys():
			if isinstance(kwargs[k], int):
				kwargs[k] = str(kwargs[k])
			if k.endswith('_'):
				v = kwargs[k]
				del kwargs[k]
				kwargs[k.rstrip('_')] = v


		ovlocal()

		return self._call('eth_sendTransaction', [kwargs])

	def accounts(self):
		return self._call('eth_accounts')

	def getTransactionReceipt(self, txhash):
		return self._call('eth_getTransactionReceipt', [txhash])

	def poll(self, call, args):
		res = None
		while res == None:
			res = call(*args)
			time.sleep(0.4)
		return res


eth = EthRpc(*RpcHost)
prim_acc = eth.accounts()[0]

def compile_internal(src, rpc=CompileOverRpc):
	if isinstance(src, file):
		src = src.read()

	if rpc:
		res = eth._call('eth_compileSolidity', [src])
		return res

	else:
		p = subprocess.Popen([Solc, '--combined-json', 'binary,json-abi'], shell=False,
						stdin=subprocess.PIPE,
						stdout=subprocess.PIPE,
						stderr=subprocess.PIPE)
		stdout, stderr = p.communicate(src)
		#print 'OET'
		#print stdout
		print 'ERR'
		print stderr
		js = json.loads(stdout)
		return {
			ConName: {
				'code': js['contracts'][ConName]['binary'],
				'info': {
					'abiDefinition': json.loads(js['contracts'][ConName]['json-abi'])
				}
			}
		}


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
	compiled = compile_internal(open(MainStore.in_root('app/sol/{}.sol'.format(ConName))))
	ovlg().data('heres the compiled stuff', compiled)

	code = compiled[ConName]['code']
	abi = abi_to_ascii(compiled[ConName]['info']['abiDefinition'])

	ovlg().data(code, abi)
	print '---- ABI ---- %< ----'
	print json.dumps(abi, indent=None)
	return ContractInfo(abi=abi, code=code, name=ConName)


def deploy(ci):
	# actual deployment
	res = eth.sendTransaction(data=ci.code, from_=prim_acc, gas=1800000)
	tx = eth.poll(eth.getTransactionReceipt, [res])
	ovlg().data( tx=tx )
	ci.addr = addr_noprefix(tx['contractAddress'])

	# ok now deployed, save it
	ci.register_with_store(MainStore)

	print '---- ADDR ---- %< ----'
	print ci.addr

	register(ConName, ci.addr)

	print 'Registered as ', ConName, ' deployed from', prim_acc
	return ci


def register(con_name, addr, from_=prim_acc):
	# reserve the name first using primary account
	data = transl.encode('reserve', [con_name]).encode('hex')
	eth.sendTransaction(data=data, from_=from_, to=RegistrarAddr, gas=10000 * 190)

	# set address to latest deployment
	data = transl.encode('setAddress', [con_name, str(addr), True]).encode('hex')
	eth.sendTransaction(data=data, from_=from_, to=RegistrarAddr, gas=10000 * 190)

def name_accounts():
	register('Golemus', addr_noprefix(eth.accounts()[0]), eth.accounts()[0])
	register('Pepa Stark', addr_noprefix(eth.accounts()[1]), eth.accounts()[1])

def add_testdata(ci):
	contract_api = eabi.ContractTranslator(ci.abi)
	gas = 400*1000

	data = contract_api.encode('createJob', ['petty']).encode('hex')
	recpt = eth.sendTransaction(data=data, from_=prim_acc, to=ci.addr, gas=gas, value=str(10L**18))

	data = contract_api.encode('createJob', ['Hello Kitty']).encode('hex')
	recpt = eth.sendTransaction(data=data, from_=eth.accounts()[0], to='0x' + ci.addr, gas=gas, value=str(2*10**18))

	data = contract_api.encode('addSolution', ['stupid pink animal', addr_noprefix(prim_acc), 1]).encode('hex')
	recpt = eth.sendTransaction(data=data, from_=prim_acc, to=ci.addr, gas=gas)


def registrar_get_addr(name):
	data = transl.encode('addr', [name]).encode('hex')
	return eth._call('eth_call', [{'data': data, 'to': RegistrarAddr}, 'latest'])


def write_abi(ci):
	path = MainStore.in_root('app/client/lib/compatibility/{}.abi.js'.format(ci.name))
	with open(path, 'wc') as outf:
		outf.write('window.{}ABI = {};'.format(ci.name, json.dumps(ci.abi)))


def mine():
	eth._call('miner_start', [1])

def rest():
	eth._call('miner_stop')


def update_contract():
	try:
		ci = compile()
		ci = deploy(ci)

		write_abi(ci)
		add_testdata(ci)
	finally:
		MainStore.save()


def testdata():
	ci = MainStore.last_ci()
	add_testdata(ci)


def cmd_deploy():
	ci = compile()
	ci = deploy(ci)

def cmd_init():
	ConName = 'GlobalRegistrar'
	ci = compile()
	ci = deploy(ci)
	print 'Registrar at', ci.addr


ACTIONS = {
	'up': update_contract,
	'mine': mine,
	'rest': rest,
	'testdata': testdata,
	'deploy': cmd_deploy,
	'init': cmd_init
}

if __name__ == '__main__':
	parser = argparse.ArgumentParser( description='Roboth.web3 deployment script' )
	parser.add_argument('mode', action='store', choices=ACTIONS.keys(), default='up')

	args = parser.parse_args()
	ACTIONS[args.mode]()
