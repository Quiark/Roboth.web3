
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// A collection for the Accounts component
Accounts = new Mongo.Collection('accounts', {connection: null});
new PersistentMinimongo(Accounts);

/**
	UserData is a mirror of UserData mapping in the contract, but it doesn't contain the
	whole DictJob and Solution objects, only links. Also doesn't contain the next_id values :)

	UserData {
		address: Address,
		jobs: [MongoId],
		solutions: [MongoId]
	}

	DictJobs {
		_id: MongoId
		idx: int(the numeric ID in the contract)
		word: String
		reward: int
		owner: Address
	}

	Solutions {
		_id: MongoId
		job_id: MongoId
		job_idx, the numeric ID of the DictJob from contract
		idx: int(the numeric ID in the contract)

		desc: String
		owner: Address
	}

*/

