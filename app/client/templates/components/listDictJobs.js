var template_this = Template['components_listDictJobs'];


Meteor.startup(function() {
	window.RoEthCls.instance().UpdateUserData();

});

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoEthCls.instance().UpdateUserData();
	},

	'click .job_answer': function(event, tpl) {
		var btn = $(event.currentTarget);
		var job = rUserData.get()[btn.data('owner')].jobs[btn.data('jobId')];
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
		return _.map(rUserData.get(), function(v, k) {
			v['address'] = k;
			return v;
		});
    },

    'my_jobid': function() {
		return RoEthCls.MyJobId.get();
    }
});
