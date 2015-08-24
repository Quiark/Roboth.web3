var template_this = Template['components_listDictJobs'];


Meteor.startup(function() {
	// we have to init this here for autoruns to run correctly
	RoEthCls.instance();
});

function select_job(btn, varname) {
    var job = RoInst().userdata_mgr.get()[btn.data('owner')].jobs[btn.data('jobId')];
    Session.set(varname + '_data', {
        idx: btn.data('jobId'),
        word_owner: btn.data('owner'),
        word: job.word,
        reward: job.reward
    });

}

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoInst().userdata_mgr.update();
	},

	'click .job_answer': function(event, tpl) {
		var btn = $(event.currentTarget);
        select_job(btn, 'createSolution');
		Session.set('createSolution_visible', true);
	},

	'click .job_solutions': function(event, tpl) {
		var btn = $(event.currentTarget);
        select_job(btn, 'listSolutions');
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
