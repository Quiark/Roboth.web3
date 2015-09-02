var template_this = Template['components_listDictJobs'];


Meteor.startup(function() {
	// we have to init this here for autoruns to run correctly
	RoEthCls.instance();
});

function select_job($elem, varname) {
	var guid = ObjGuid.from_str($elem.data('jobGuid'));
    var job = RoInst().userdata_mgr.get()[guid.user].jobs[guid.ix];
    Session.set(varname + '_data', {
        //idx: btn.data('jobId'),
        //word_owner: btn.data('owner'),
        word: job.word,
        reward: job.reward,
        job_guid: guid
    });

}

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoInst().userdata_mgr.update();
	},

	'click .job_answer': function(event, tpl) {
		var $elem = $(event.currentTarget).parent();
        select_job($elem, 'createSolution');
		Session.set('createSolution_visible', true);
	},

	'click .job_solutions': function(event, tpl) {
		var $elem = $(event.currentTarget).parent();
        select_job($elem, 'listSolutions');
	}
});


template_this.helpers({
    'userdata': function() {
		return _.map(RoInst().userdata_mgr.get(), function(v, k) {
			v['address'] = k;
			return v;
		});
    },

});
