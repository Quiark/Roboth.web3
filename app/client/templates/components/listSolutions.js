var template_this = Template['components_listSolutions'];

Meteor.startup(function() {
	Session.set("listSolutions_data", {
		idx: null,
		word_owner: null,
		word: null,
		reward: null
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
		if (sel.word_owner == null) return [];
		var word = userdata[sel.word_owner].jobs[sel.idx].word;

		// iterate all, find the solutions for the job we are interested in
		var result = [];

		for (var s_id = 0; s_id < userdata[sel.word_owner].solutions.length; s_id++) {
			var s = userdata[sel.word_owner].solutions[s_id];

			if (s.job_idx.equals(sel.idx)) {
				result.push(s);
			}
		}

		return result;
	}
});

function solutionUpDownVote(up, event, tpl) {
	var btn = $(event.currentTarget);
	var sol_id = btn.data('solId');
	var sol_user = btn.data('solUser');

	if ((sol_id !== '') && sol_user) {
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
