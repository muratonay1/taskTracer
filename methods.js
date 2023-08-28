let RealtimeDatabase = (

	function(){
		function authentication(email,password) {
			
		}

		function getNotes(args){
			if(Object.prototype.toString.call(args.fail) == "[object Function]"){
				let fail = args.fail;
				try 
				{
					let path = args.path;
					let done = args.done;
					firebase.database().ref(path+"/").on("value",(snapshot)=>{
						done(snapshot.val());
					})
				} catch (error) {
					fail(error);
				}
			}
			else throw new Error("fail is not callback function").stack;
		}

		function saveNotes(args) {
			if (Object.prototype.toString.call(args.fail) == "[object Function]") {
				let fail = args.fail;
				try {
					let path = args.path;
					let done = args.done;
					let params = args.params;
					firebase
						.database()
						.ref(path)
						.set(params,(error)=>{
							if(error) fail(error);
							else done(true);
						})
				} catch (error) {
					throw new Error(error).stack;
				}
			} else throw new Error("fail is not callback function").stack;
		}

		

		return{
			getNotes:getNotes,
			saveNotes:saveNotes
		}

	}
)();

let Utility = (
	function(){

		function setButtonReadOnly(value){
			let buttonGroups = document.querySelectorAll("button");
			for(let button of buttonGroups){
				button.disabled = value;
			}
		}

		return{
			setButtonReadOnly:setButtonReadOnly
		}
	}
)();