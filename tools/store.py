import os
import sys
import json
import cPickle

from overlog import ovlg, ovlocal

class Store(object):
	def __init__(self):
		self.path = 'store.cpickle'
		self.data = {
			'contracts': list()
		}

		self.load()

	def add_ci(self, ci):
		self.data['contracts'].append(ci)

	def last_ci(self):
		return self.data['contracts'][-1]

	def load(self):
		if not os.path.exists(self.path): return
		with open(self.path, 'rb') as inf:
			self.data = cPickle.load(inf)
			self.data['contracts'] = list(self.data['contracts'])
			ovlg().data(self.data)

	def save(self):
		with open(self.path, 'wcb') as outf:
			cPickle.dump(self.data, outf, 2)


class ContractInfo(object):
	def __init__(self, addr=None, abi=None, code=None, name=None):
		self.addr = addr
		self.abi = abi
		self.code = code
		self.name = name

	def register_with_store(self, st):
		#self._store = st
		st.add_ci(self)
