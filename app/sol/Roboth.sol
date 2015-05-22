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


	// map to job id
	mapping (address => uint) public m_dict_jobs;

	// job id => word to explain
	mapping (uint => bytes32) public m_dict_words;

	uint public m_next_jobid;

	function Roboth() {
		m_next_jobid = 0;
	}

	/// adds a word to translate
	function createDictionaryJob(bytes32 word) returns (uint) {
		// TODO: must send X ETH as reward
		uint jobid = m_next_jobid;
		m_next_jobid += 1;

		m_dict_jobs[msg.sender] = jobid;
		m_dict_words[jobid] = word;
		return jobid;
	}

	function getDictionaryJob(uint jobid) constant returns (bytes32) {
		return m_dict_words[jobid];
	}

	function getDictionaryJobIdByOwner(address owner) constant returns (uint) {
		return m_dict_jobs[owner];
	}

	function tst() constant returns (bytes32) {
		return "kitty";
	}

	function jobid() constant returns (uint) {
		return m_next_jobid;
	}
}
