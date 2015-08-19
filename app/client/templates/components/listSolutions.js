var template_this = Template['components_listSolutions'];

Meteor.startup(function() {
	Session.set("listSolutions_data", {
		job_id: null,
		job_owner: null,
		word: null

	});
});

template_this.helpers({
	'data': function() {
		var sel = Session.get('listSolutions_data');
		return sel;
	},

	'solutions': function() {
		var userdata = RoInst().userdata_mgr.get();
		var sel = Session.get('listSolutions_data');
		if (sel.job_owner == null) return [];
		var word = userdata[sel.job_owner].jobs[sel.job_id].word;

		// iterate all, find the solutions for the job we are interested in
		var result = [];

		for (var s_id = 0; s_id < in userdata[sel.job_owner].solutions.length; s_id++) {
			var s = userdata[sel.job_owner].solutions[s_id];

			if (s.job_idx.equals(sel.job_id)) {
				var extended = _.clone(s);
				extended.author = k;
				result.push(extended);
			}
		}

		return result;
	}
});

function solutionUpDownVote(up, event, tpl) {
	var btn = $(event.currentTarget);
	var sol_id = btn.data('solId');
	var sol_user = btn.data('solUser');
	/*
	var job_id = btn.data('jobId');
	var job_user = btn.data('jobUser');
	*/

	if ((sol_id !== '') && sol_user && (job_id !== '') && job_user) {
		Roboth.solUpDownVote.sendTransaction(up, sol_id, sol_user, {from: Helpers.selectedAcc(), gas: 100 * 1000});
	} else {
		// TODO report some error
		console.error('something is null');
	}

};

template_this.events({
	'click .sol_upvote': function(event, tpl) {
		solutionUpDownVote(true, event, tpl);
	},
	'click .sol_downvote': function(event, tpl) {
		solutionUpDownVote(false, event, tpl);
	}

});
