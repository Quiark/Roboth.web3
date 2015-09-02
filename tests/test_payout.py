import os
import sys
import pytest

sys.path += ['.', '..', 'tools', '../populus']

from overlog import ovlg, ovlocal
import overlog
import contract as mycon
from populus import contracts as pocon
from eth_rpc_client import Client

overlog.SELECTED_GROUPS = ['overlog']

class Dummy(object):
	pass


eth = Client(*mycon.RpcHost)
ci = mycon.MainStore.last_ci_named(mycon.ConName)

co_cls = pocon.Contract(eth, ci.name, {
	'info': {
		'abiDefinition': ci.abi,
		'source': ''
	},
	'code': ci.code
})

# contract obj
cobj = co_cls(ci.addr)

eth.accounts = eth.get_accounts()
eth.defaults['from'] = eth.accounts[0]


def find_job(author, wrd):
	usrdat = cobj.m_userdata.call(mycon.addr_noprefix(author))
	for i in range(usrdat[0]):
		job = cobj.getDictJob.call(mycon.addr_noprefix(author), i)
		if mycon.no0_suffix(job[0]) == wrd: return i


def find_sol(job_user, job_id, author, text):
	usrdat = cobj.m_userdata.call(job_user)
	for i in range(usrdat[1]):
		sol = cobj.getSolution.call((job_user), i)
		ovlg().data(sol, job_user=job_user, job_id=job_id, author=author, text=text)
		if (mycon.no0_suffix(sol[0]) == mycon.addr_noprefix(author)) and (sol[1] == job_id) and (mycon.no0_suffix(sol[2]) == text):
			return i


@pytest.yield_fixture
def eth_snapshot():
	orig_snap_id = eth.make_rpc_request('evm_snapshot', [])['result']

	yield ()

	eth.make_rpc_request('evm_revert', [orig_snap_id])



def test_Roboth_basic(eth_snapshot):
	acc_job_author = eth.accounts[0]
	acc_sol_best = eth.accounts[1]
	wrd = 'tresinka'
	sol1 = 'kulata cervena vec'

	cobj.createJob.sendTransaction(wrd, 1,
									_from=acc_job_author,
									gas=400*1000,
									value=10**18)
	print 'new payout_blocks value', cobj.PAYOUT_BLOCKS.call()

	# now list result

	jid = find_job(acc_job_author, wrd)
	assert jid != None
	print 'job id', jid
	cobj.addSolution.sendTransaction(sol1, acc_job_author, jid,
									_from=acc_sol_best,
									gas=500000)


	sol_id = find_sol(acc_job_author, jid, acc_sol_best, sol1)
	assert sol_id != None
	print 'sol_id', sol_id
	for i in range(2, len(eth.accounts)):
		cobj.solUpDownVote.sendTransaction(True, sol_id, (acc_job_author),
											_from=eth.accounts[i],
											gas=80*1000)

	# check the votes are there now
	sol = cobj.getSolution.call(acc_job_author, sol_id)
	assert sol[3] == (len(eth.accounts) - 2)

	# do payout
	print 'that job', cobj.getDictJob.call(acc_job_author, jid)
	print 'current block', eth.get_block_number()
	payable = cobj.checkPayout.call(acc_job_author, sol_id,
											_from=acc_job_author,
											gas=2500000)
	#ovlg().data(payable, eth.get_transaction_receipt(payable))
	assert payable == True


def make_job(job):
	cobj.createJob.sendTransaction(job.wrd, 1,
									_from=job.author,
									gas=400*1000,
									value=10**18)
	job.job_id = find_job(job.author, job.wrd)


def make_sol(sol):
	cobj.addSolution.sendTransaction(sol.desc, sol.job.author, sol.job.job_id,
									_from=sol.author,
									gas=500000)
	sol.sol_id = find_sol(sol.job.author, sol.job.job_id, sol.author, sol.desc)


def upvote(up, sol, _from):
	cobj.solUpDownVote.sendTransaction(up, sol.sol_id, sol.job.author,
									_from=_from,
									gas=80*1000)

def get_sol(sol):
	t = cobj.getSolution.call(sol.job.author, sol.sol_id)
	return {'author': t[0], 'job_id': t[1], 'desc': t[2], 'votes': t[3]}


def get_job(job):
	t = cobj.getDictJob.call(job.author, job.job_id)
	return {'word': t[0], 'reward': t[1], 'bl_payout': t[2]}


def setup_2_solutions():
	job = Dummy()
	job.wrd = 'antilopa'
	job.author = eth.accounts[0]

	sol_best = Dummy()
	sol_best.author = eth.accounts[1]
	sol_best.desc = 'takove zvire'
	sol_best.job = job

	sol_second = Dummy()
	sol_second.author = eth.accounts[0]
	sol_second.desc = 'proste nevim'
	sol_second.job = job

	make_job(job)
	make_sol(sol_best)
	make_sol(sol_second)

	upvote(True, sol_best, eth.accounts[0])
	upvote(True, sol_best, eth.accounts[1])
	upvote(True, sol_best, eth.accounts[2])

	upvote(False, sol_second, eth.accounts[0])
	return (job, sol_best, sol_second)


def test_Roboth_payout_denied(eth_snapshot):
	job, sol_best, sol_second = setup_2_solutions()

	sol_best.payable = cobj.checkPayout.call(job.author, sol_best.sol_id, _from=eth.accounts[0])
	sol_second.payable = cobj.checkPayout.call(job.author, sol_second.sol_id, _from=eth.accounts[1])

	sol_best.state = get_sol(sol_best)
	sol_second.state = get_sol(sol_second)
	job.state = get_job(job)

	ovlocal()
	assert  sol_best.payable == True
	assert  sol_second.payable == False


def test_Roboth_payout_sent(eth_snapshot):
	job, sol_best, sol_second = setup_2_solutions()
	job.state = get_job(job)

	# try to receive payment
	sol_best.author_orig_balance = eth.get_balance(sol_best.author)
	orig_balances = [eth.get_balance(x) for x in eth.accounts + [ci.addr]]


	# fund it
	cobj.checkPayout.sendTransaction(job.author, sol_best.sol_id,
									_from=eth.accounts[0],
									gas=120*1000)


	new_balances = [eth.get_balance(x) for x in eth.accounts + [ci.addr]]
	balance_increase = eth.get_balance(sol_best.author) - sol_best.author_orig_balance
	ovlocal()
	assert eth.get_balance(sol_best.author) > sol_best.author_orig_balance
	assert balance_increase >= (job.state['reward'] - 10**17)

	# check that can't send twice
	sol_best.payable = cobj.checkPayout.call(job.author, sol_best.sol_id, _from=eth.accounts[0])
	assert sol_best.payable == False
