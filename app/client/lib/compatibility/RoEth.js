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

	this. RobothABI = 
		[{"inputs": [], "type": "function", "constant": true, "name": "m_next_jobid", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [{"type": "address", "name": "owner"}], "type": "function", "constant": true, "name": "getDictionaryJobIdByOwner", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [{"type": "uint256", "name": ""}], "type": "function", "constant": true, "name": "m_dict_words", "outputs": [{"type": "bytes32", "name": ""}]}, {"inputs": [{"type": "uint256", "name": "jobid"}], "type": "function", "constant": true, "name": "getDictionaryJob", "outputs": [{"type": "bytes32", "name": ""}]}, {"inputs": [], "type": "function", "constant": true, "name": "tst", "outputs": [{"type": "bytes32", "name": ""}]}, {"inputs": [{"type": "address", "name": ""}], "type": "function", "constant": true, "name": "m_dict_jobs", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [], "type": "function", "constant": true, "name": "jobid", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [{"type": "bytes32", "name": "word"}], "type": "function", "constant": false, "name": "createDictionaryJob", "outputs": [{"type": "uint256", "name": ""}]}]
	;
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

RoEthCls.prototype.UpdateDictJobs = function() {
	for (var i = 0; i < 10; i++) {
		var job_wrd = this.Roboth.getDictionaryJob(i);
		if ((job_wrd != null) && (job_wrd != '')) {
			window.DictJobs.update(
                {number: i},
                {$set: {word: job_wrd}},
                {upsert: true});
		}
	}

}

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
