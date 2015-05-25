/**
This is kind of a bridge between the eth / smart contract and the Meteor reactive-driven world
named RoEth for a lack of imagination

@module RoEth
*/

function RoEthCls() {
	this. RegistrarABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"name","outputs":[{"name":"o_name","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"content","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"reserve","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"subRegistrar","outputs":[{"name":"o_subRegistrar","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_registrar","type":"address"}],"name":"setSubRegistrar","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"Registrar","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_a","type":"address"},{"name":"_primary","type":"bool"}],"name":"setAddress","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_content","type":"bytes32"}],"name":"setContent","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"disown","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"register","outputs":[{"name":"","type":"address"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"}],"name":"Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"}],"name":"PrimaryChanged","type":"event"}];
	this. RegistrarAddr = "0xc6d9d2cd449a754c494264e1809c50e34d64562b";
	this. RegistrarAPI = web3.eth.contract(this.RegistrarABI);
	this. Registrar = this.RegistrarAPI.at(this.RegistrarAddr);

	this. RobothABI = window.RobothABI;
	this. RobothAPI = web3.eth.contract(this.RobothABI);
	this. Roboth = this.RobothAPI.at(this.Registrar.addr('Roboth'));


	// singleton
	window.Roboth = this.Roboth;
}

window.RoEthCls = RoEthCls;

RoEthCls.instance = function() {
	if (window._roeth_inst == null) {
		window._roeth_inst = new window.RoEthCls();
	}
	return window._roeth_inst;
}


RoEthCls.prototype.UpdateUserData = function(after) {
	var xUserData = {};
	// TODO : implement after
	// TODO: make this a reactive dict so it can be refreshed
	for (var i = 0; i < Roboth.m_next_userid().toFixed(); i++) {
		var user = Roboth.m_userdata_idx(i)
		var usrdat = Roboth.m_userdata(user);

		var user_obj = {
			address: user,
			jobs: [],
			solutions: []
		};

		var mem_user_obj = {
			jobs: [],
			solutions: []
		};

		// fetch dictjobs
		for (var dji = 0; dji < usrdat[0].toFixed(); dji ++) {
			var res = Roboth.getDictJob(user, dji);
			var job = {
				word: res[0],
				reward: res[1].toString(),
				owner: user,
				idx: dji
			};
			var _id = DictJobs.insert(job);
			user_obj.jobs.push(_id);
			mem_user_obj.jobs.push(job);
		}

		UserData.insert(user_obj);
		xUserData[user] = mem_user_obj;
	}

	for (var i = 0; i < Roboth.m_next_userid().toFixed(); i++) {
		var user = Roboth.m_userdata_idx(i)
		var usrdat = Roboth.m_userdata(user);
		var sol_ids = [];

		// fetch solutions
		for (var si = 0; si < usrdat[1].toFixed(); si ++) {
			var res = Roboth.getSolution(user, si);
			var sol = {
				job_user: res[0],
				job_idx: res[1],
				idx: si,

				desc: res[2]
			};

			sol.job_id = DictJobs.find({owner: sol.job_user, idx: sol.job_idx})._id;
			var _id = Solutions.insert(sol);
			sol_ids.push(_id);
			xUserData[user].solutions.push(sol);
		}

		// update UserData
		UserData.update({address: user}, {'$set': {solutions: sol_ids}});
	}

	// update UI
	rUserData.set(xUserData);
}

/* idea
function SolidityIdIterator(inst, max_fn, item_fn) {
	this.inst = inst;
	this.max_fn = max_fn;
	this.item_fn = item_fn;

}
*/


/**
how long it takes for things to get stored in blockchain
so we can update the GUI after this
*/
RoEthCls. BLOCK_TIME = 12 * 1000;  // ms

// a Reactive wrapper around the MyJobId value
RoEthCls.MyJobId = {
	id: null,

	dep: new Deps.Dependency(),
	get: function() {
		this.dep.depend();

		return this.id;
	},

	refresh: function(after) {
		var self = this;
		if (after) {
			setTimeout(function() { self.refresh(null); }, after);
			return;
		} else {
			// fetch it from the blockchain
			var my_acc = Helpers.selectedAcc();
			this.id = Roboth.getDictionaryJobIdByOwner(my_acc);

			// notify
			this.dep.changed();
		}
	}
};

// TODO: automated later-call 
RoEthCls.BlockUpdatedFn = function(fn) {};


