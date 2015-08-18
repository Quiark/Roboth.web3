contract owned {

	function owned() {
		owner = msg.sender;
	}

	modifier onlyowner() {
		if(msg.sender==owner) _
	}

	address owner;
}

contract mortal is owned {
	function kill() {
		if (msg.sender == owner) suicide(owner); 
	}
}


contract Roboth is mortal {
	// TODO: consider fees when sending rewards
	// TODO: break it into more contracts when useful
	// TODO: rename this to DictRoboth
	// TODO: what if word already exists?
	//		or for deleting words
	//		may use a cache on server to keep track of what can be overwritten
	// TODO: use shorter types for ids
	// TODO: add payout, each user can invoke check for himlef
	
	const PAYOUT_BLOCKS = 10000;
	const GAS_TX = 21000;
	const GAS_PRICE = 60000000000;
	const FEE_PAYOUT = GAS_TX * GAS_PRICE;

	struct DictJob {
		bytes32 word;
		uint reward;
		uint bl_payout;
		//address owner;

		// TODO: how to list solutions to this job?
		//   IDEA: keep this (redundant data) in the webserver? 
		//		* illustrates the point about saving storage
		//		* even if data on server lost, can be regenerated from blockchain
		//		? would be tricky to sync different versions (easier if data is append-only)
	}

	struct Solution {
		// identifier of the DictJob
		address job_user;
		uint32 job_id;

		// TODO: support longer data, possibly using byte array?
		bytes32 desc;

		int32 votes;

	}

	struct UserData {
		mapping (uint32 => DictJob) jobs;
		mapping (uint32 => Solution) solutions;

		// pack them together
		uint32 next_jobid;
		uint32 next_solutionid;
	}

	mapping (address => UserData) public m_userdata;
	mapping (uint32 => address) public m_userdata_idx;
	uint32 public m_next_userid = 0;

	// voter -> sol_user -> sol_id -> delta
	// delta is +1 or -1 or 0 states up, down or no vote
	// voter is the sender of transaction
	// sol_user + sol_id is the id of solution
	mapping (address => mapping(address => mapping(uint32 => int8))) public m_votes;


	/// adds a word to translate
	function createJob(bytes32 word) {
		if (msg.value < 1 ether) return;   // must provide some reward

		_ensureNewUser();
		UserData usrdat = m_userdata[msg.sender];

		uint32 jobid = usrdat.next_jobid;
		usrdat.jobs[jobid].word = word;
		usrdat.jobs[jobid].reward = msg.value - 100; // TODO fee
		usrdat.jobs[jobid].bl_started = block.number + PAYOUT_BLOCKS;
		usrdat.next_jobid += 1;


		// TODO: cant return, only send event
	}

	function addSolution(bytes32 my_desc, address job_user, uint32 job_id) {
		_ensureNewUser();
		UserData usrdat = m_userdata[msg.sender];

		uint32 solid = usrdat.next_solutionid;
		usrdat.solutions[solid].desc = my_desc;
		usrdat.solutions[solid].job_user = job_user;
		usrdat.solutions[solid].job_id = job_id;
		usrdat.solutions[solid].votes = 0;
		usrdat.next_solutionid += 1;
	}

	function solUpDownVote(bool up, uint32 sol_id, address sol_user) {
		int8 delta = 1;
		if (up == false) delta = -1;

		if (m_votes[msg.sender][sol_user][sol_id] == delta) return;

		m_userdata[sol_user].solutions[sol_id].votes += delta;
		m_votes[msg.sender][sol_user][sol_id] += delta;
	}

	// WIP / unfinished
	function checkPayout(uint32 sol_id) {
		Solution sol = m_userdata[msg.sender].solutions[sol_id];
		DictJob job = m_userdata[sol.job_user].jobs[sol.job_id];
		if (block.number < job.bl_payout) return;

		if (job.reward > 0) {
			msg.sender.send(job.reward - FEE_PAYOUT);

			job.reward = 0;
		}
	}

	// ======= Accessors
	function getDictJob(address user, uint32 id) public constant returns (bytes32 word, uint reward) {
		DictJob j = m_userdata[user].jobs[id];

		word = j.word;
		reward = j.reward;
	}

	function getSolution(address user, uint32 id) public constant returns (address job_user, uint32 job_id, bytes32 desc, int32 votes) {
		Solution s = m_userdata[user].solutions[id];

		job_user = s.job_user;
		job_id = s.job_id;
		desc = s.desc;
		votes = s.votes;
	}

	function getVote(address voter, address sol_user, uint32 sol_id) returns (int8){
		return m_votes[voter][sol_user][sol_id];
	}

	// ======= Internal State Management

	function _isNewUser() private returns (bool) {
		UserData usrdat = m_userdata[msg.sender];

		// is new user when next_jobid or next_solutionid is nonzero
		// because any write to that struct would increase these numbers
		if ((usrdat.next_solutionid > 0) || (usrdat.next_jobid > 0)) {
			return false;
		} else {
			return true;
		}
	}

	function _ensureNewUser() private returns (bool) {
		bool isnew = _isNewUser();

		if (isnew) {
			m_userdata_idx[m_next_userid] = msg.sender;
			m_next_userid += 1;

		} else {
			return isnew;
		}
	}
}
