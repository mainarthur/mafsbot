console.log(__filename + " loaded");

module.exports = function isCommandMsg(msg) {
	if(msg.entities == null)
		return null;
		
	let text = msg.text || msg.caption;
	if(text == null)
		return null;
		
	for(let i = 0; i < msg.entities.length; i++) {
		let e = msg.entities[i];
		if(e.offset == 0 && e.type == "bot_command") {
			
				
			let res = {
				command: text.substr(1, e.length-1),
				args: text.substr(e.length+1)
			}
			
			if(res.command.indexOf("@") != -1) {
				res.command = res.command.substr(0, res.command.indexOf("@"));
			}

			return res;
		}
	}
	return null;
}
