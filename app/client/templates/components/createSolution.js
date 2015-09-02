var template_this = Template['components_createSolution'];

Meteor.startup(function() {
	Session.set("createSolution_data", {
		word: null,
		word_owner: null,
		reward: null,
		idx: null,
        job_guid: null
	});

	Session.set('createSolution_visible', false);
});

template_this.events({
	'click #bSubmit': function(event, tpl) {
		window.RoEthCls.instance();

		var data = Session.get('createSolution_data');
		var solution = tpl.$('#iSolution').val();

		Roboth.addSolution(solution, data.job_guid.user, data.job_guid.ix, {from: Helpers.selectedAcc(), gas: 400 * 1000});
		RoEthCls.instance().userdata_mgr.setDirty();
	}

});

template_this.helpers({
	'data': function() {
		return Session.get('createSolution_data');
	},

	'sel_acc': function() {
		return Helpers.selectedAcc();
	},

	'tpl_display': function() {
		return Session.get('createSolution_visible') ? 'block' : 'none';
	}
});
