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

		for (var k in userdata) {
			for (var s_id = 0; s_id < userdata[k].solutions.length; s_id++) {
				var s = userdata[k].solutions[s_id];

				if ((s.job_user == sel.job_owner) && (s.job_idx.equals(sel.job_id))) {
					var extended = _.clone(s);
					extended.author = k;
					result.push(extended);
				}
			}

		}

		return result;
	}
});
