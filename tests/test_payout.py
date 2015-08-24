import os
import sys
import pytest

sys.path += ['.', '..', 'tools', '../populus']

from overlog import ovlg
import overlog
import contract as mycon
from populus import contracts as pocon
from eth_rpc_client import Client

overlog.SELECTED_GROUPS = ['overlog']
ovlg().trace_except()


eth = Client(*mycon.RpcHost)

ci = mycon.MainStore.last_ci_named(mycon.ConName)

co_cls = pocon.Contract(eth, ci.name, {
	'info': {
		'abiDefinition': ci.abi,
		'source': ''
	},
	'code': ci.code
})

eth.accounts = eth.get_accounts()
eth.defaults['from'] = eth.accounts[0]
acc_job_author = eth.accounts[0]
acc_sol_best = eth.accounts[1]
wrd = 'vesela kravicka'
cobj = co_cls(ci.addr)
cobj.createJob.sendTransaction(wrd,
								_from=acc_job_author,
								gas=400*1000,
								value=10**18)
# now list result
def find_job(author, wrd):
	usrdat = cobj.m_userdata.call(mycon.addr_noprefix(author))
	for i in range(usrdat[0]):
		if cobj.getDictJob.call(mycon.addr_noprefix(author), i)[0] == wrd: return i

jid = find_job(acc_job_author, wrd)
cobj.addSolution.sendTransaction('hopkajici po travicce', acc_job_author, jid,
								_from=acc_sol_best,
								gas=500000)
