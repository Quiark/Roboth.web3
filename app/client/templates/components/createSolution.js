var template_this = Template['components_createSolution'];

Meteor.startup(function() {
	Session.set("createSolution_data", {
		word: null,
		word_owner: null,
		reward: null,
		idx: null
	});

	Session.set('createSolution_visible', false);
});

template_this.events({
	'click #bSubmit': function(event, tpl) {
		window.RoEthCls.instance();

		var data = Session.get('createSolution_data');
		var solution = tpl.$('#iSolution').val();

		Roboth.addSolution(solution, data.word_owner, data.idx, {from: Helpers.selectedAcc(), gas: 400 * 1000});

		// TODO: user feedback

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
