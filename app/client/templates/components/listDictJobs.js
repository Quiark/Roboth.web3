var template_this = Template['components_listDictJobs'];


Meteor.startup(function() {
	// we have to init this here for autoruns to run correctly
	RoEthCls.instance();
});

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoInst().userdata_mgr.update();
	},

	'click .job_answer': function(event, tpl) {
		var btn = $(event.currentTarget);
		var job = RoInst().userdata_mgr.get()[btn.data('owner')].jobs[btn.data('jobId')];
		Session.set('createSolution_data', {
			idx: btn.data('jobId'),
			word_owner: btn.data('owner'),
			word: job.word,
			reward: job.reward
		});
		Session.set('createSolution_visible', true);
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
