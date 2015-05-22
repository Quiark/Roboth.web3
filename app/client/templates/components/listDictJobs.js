var template_this = Template['components_listDictJobs'];

this. DictJobs = new Mongo.Collection();

Meteor.startup(function() {
	window.RoEthCls.instance().UpdateDictJobs();

});

template_this.events({
	'click #bRefreshList': function(event, tpl) {
		RoEthCls.instance().UpdateDictJobs();
	}

});


template_this.helpers({
    'dict_jobs': function() {
        return DictJobs.find({});
    },

    'my_jobid': function() {
		return RoEthCls.MyJobId.get();
    }
});
