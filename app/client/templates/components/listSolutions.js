var template_this = Template['components_listSolutions'];

Meteor.startup(function() {
	Session.set("listSolutions_data", {
		idx: null,
		word_owner: null,
		word: null,
		reward: null,
		job_guid: null
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
		if (sel.job_guid == null) return [];
		var usrdat = userdata[sel.job_guid.user]; 

		var word = usrdat.jobs[sel.job_guid.ix].word;

		// iterate all, find the solutions for the job we are interested in
		var result = [];

		for (var s_id = 0; s_id < usrdat.solutions.length; s_id++) {
			var s = usrdat.solutions[s_id];

			if (s.job_idx.equals(sel.job_guid.ix)) {
				result.push(s);
			}
		}

		return result;
	}
});

function solutionUpDownVote(up, event, tpl) {
	var $row = $(event.currentTarget).parent();
	var sol_guid = ObjGuid.from_str($row.data('solGuid'));

	if (sol_guid !== null) {
		Roboth.solUpDownVote.sendTransaction(up, sol_guid.ix, sol_guid.user, {from: Helpers.selectedAcc(), gas: 100 * 1000});
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
