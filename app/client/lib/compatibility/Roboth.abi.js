window.RobothABI = [{"inputs": [], "type": "function", "constant": true, "name": "FEE_PAYOUT", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [{"type": "address", "name": "user"}, {"type": "uint32", "name": "id"}], "type": "function", "constant": true, "name": "getDictJob", "outputs": [{"type": "bytes32", "name": "word"}, {"type": "uint256", "name": "reward"}, {"type": "uint256", "name": "bl_payout"}]}, {"inputs": [{"type": "uint256", "name": "val"}], "type": "function", "constant": false, "name": "_setPayoutBlocks", "outputs": []}, {"inputs": [], "type": "function", "constant": true, "name": "PAYOUT_BLOCKS", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [], "type": "function", "constant": false, "name": "kill", "outputs": []}, {"inputs": [{"type": "string", "name": "msg"}, {"type": "uint256", "name": "a"}], "type": "function", "constant": false, "name": "Log1", "outputs": []}, {"inputs": [{"type": "address", "name": "voter"}, {"type": "address", "name": "sol_user"}, {"type": "uint32", "name": "sol_id"}], "type": "function", "constant": false, "name": "getVote", "outputs": [{"type": "int8", "name": ""}]}, {"inputs": [{"type": "address", "name": ""}], "type": "function", "constant": true, "name": "m_userdata", "outputs": [{"type": "uint32", "name": "next_jobid"}, {"type": "uint32", "name": "next_solutionid"}]}, {"inputs": [], "type": "function", "constant": true, "name": "m_next_userid", "outputs": [{"type": "uint32", "name": ""}]}, {"inputs": [{"type": "address", "name": "job_user"}, {"type": "uint32", "name": "sol_id"}], "type": "function", "constant": false, "name": "checkPayout", "outputs": [{"type": "bool", "name": ""}]}, {"inputs": [{"type": "string", "name": "msg"}], "type": "function", "constant": false, "name": "Log0", "outputs": []}, {"inputs": [{"type": "uint32", "name": ""}], "type": "function", "constant": true, "name": "m_userdata_idx", "outputs": [{"type": "address", "name": ""}]}, {"inputs": [], "type": "function", "constant": true, "name": "GAS_PRICE", "outputs": [{"type": "uint256", "name": ""}]}, {"inputs": [{"type": "bool", "name": "up"}, {"type": "uint32", "name": "sol_id"}, {"type": "address", "name": "job_user"}], "type": "function", "constant": false, "name": "solUpDownVote", "outputs": []}, {"inputs": [{"type": "string", "name": "msg"}, {"type": "uint256", "name": "a"}, {"type": "uint256", "name": "b"}], "type": "function", "constant": false, "name": "Log2", "outputs": []}, {"inputs": [{"type": "uint256", "name": "val"}], "type": "function", "constant": false, "name": "_setGasPrice", "outputs": []}, {"inputs": [{"type": "bytes32", "name": "my_desc"}, {"type": "address", "name": "job_user"}, {"type": "uint32", "name": "job_id"}], "type": "function", "constant": false, "name": "addSolution", "outputs": []}, {"inputs": [{"type": "address", "name": "user"}, {"type": "uint32", "name": "id"}], "type": "function", "constant": true, "name": "getSolution", "outputs": [{"type": "address", "name": "author"}, {"type": "uint32", "name": "job_id"}, {"type": "bytes32", "name": "desc"}, {"type": "int32", "name": "votes"}]}, {"inputs": [{"type": "address", "name": ""}, {"type": "address", "name": ""}, {"type": "uint32", "name": ""}], "type": "function", "constant": true, "name": "m_votes", "outputs": [{"type": "int8", "name": ""}]}, {"inputs": [{"type": "bytes32", "name": "word"}], "type": "function", "constant": false, "name": "createJob", "outputs": []}, {"inputs": [], "type": "function", "constant": true, "name": "GAS_TX", "outputs": [{"type": "uint256", "name": ""}]}];