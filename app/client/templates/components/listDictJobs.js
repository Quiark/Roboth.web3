var template_this = Template['components_listDictJobs'];


Meteor.startup(function() {
	window.RoEthCls.instance().UpdateUserData();

});

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoEthCls.instance().UpdateUserData();
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
