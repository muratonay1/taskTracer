let table;;
let data = [];
const staticData = [];
let searchFiled;
let findingValuesPosition = [];
let findingCount = 0;
function startTable() {
	let container = document.querySelector(".handsontable-container");
	table = new Handsontable(container, {
		data:
			Object.prototype.toString.call(data) == "[object Array]"
				? data.reverse()
				: new Array(),
		width: "100%",
		height: "400px",
		colHeaders: true,
		rowHeaders: true,
		contextMenu: true,
		rowHeights: 80,
		stretchH: "all",
		className: "htMiddle",
		search: true,
		colHeaders: ["Not Başlığı", "Not Detayı", "Ekleme Tarihi"],
		columns: [
			{ data: "noteHeader", type: "text" },
			{ data: "noteDetail", type: "text" },
			{ data: "noteDate", type: "text" },
		],
		modifyColWidth: function (width, col) {
			if (width > 150) return 100;
		},
	});
	document.getElementById("hot-display-license-info").remove();
	searchFiled = document.getElementById('search_field');
	waitMe(false);
}

function initialPrompt(callback) {
	callback(true)
}
var loadingOverlay = document.querySelector(".loading");
function waitMe(value) {
	document.activeElement.blur();
	if (value) {
		loadingOverlay.classList.remove("hidden");
	}
	else {
		loadingOverlay.classList.add("hidden");
	}
}

window.addEventListener('DOMContentLoaded', event => {
	waitMe(true);
	document.getElementById("nextFindBtn").hidden = true;
	document.getElementById("numberOfMatchRecord").hidden = true;
	const firebaseConfig = {
		//API KEYS
	};
	firebase.initializeApp(firebaseConfig);

	initialPrompt((isLoad) => {
		RealtimeDatabase.getNotes({
			path: "note",
			done: (response) => {
				if (response != null) {
					document.getElementById("tableInfoSpan").style.display = "none";
					data = [];
					for (let i = 0; i < response.length; i++) {
						if (response[i] != undefined) {
							data.push(response[i]);
							staticData.push(response[i]);
						}
					}
					document.getElementById("tableInfo").textContent = "Aktif Kayıt Sayısı: " + data.length;
					document.querySelector(".handsontable-container").innerHTML = "";
					startTable();
					Handsontable.dom.addEvent(searchFiled, "keyup", function (event) {
						var search = table.getPlugin("search");
						var queryResult = search.query(this.value);
						if (queryResult.length != 0) {
							document.getElementById("nextFindBtn").hidden = false;
							document.getElementById("numberOfMatchRecord").hidden = false;
							findingValuesPosition = [];
							queryResult = queryResult.filter((element, index) => {
								return queryResult.indexOf(element) === index;
							});
							queryResult.forEach(i => {
								findingValuesPosition.push(i.row)
							})
							findingValuesPosition = findingValuesPosition.filter(
								(element, index) => {
									return findingValuesPosition.indexOf(element) === index;
								}
							);
							document.getElementById("numberOfMatchRecord").innerText = "Eşleşen " + findingValuesPosition.length + " kayıt bulundu.";
							//console.log(queryResult); => SEARCH EDİLEN GRUBU LİSTE OLARAK DÖNER
							table.render();
						}
						else {
							document.getElementById("nextFindBtn").hidden = true;
							document.getElementById("numberOfMatchRecord").hidden = true;
							table.render();
							document.getElementById("search_field").focus();
						}

					});
				}
				else {
					waitMe(false);
					let spanInfo = "Listelenecek Kayıt Bulunamadı.";
					document.getElementById("tableInfoSpan").textContent = spanInfo;
				}
			},
			fail: (error) => {
				throw new Error(error);
			}
		});

		$(".btnSaveChanges").click(function () {
			Utility.setButtonReadOnly(true);
			waitMe(true);
			RealtimeDatabase.saveNotes({
				path: "note",
				params: data,
				done: (response) => {
					if (response) {
						Utility.setButtonReadOnly(false);
						waitMe(false);
					}
				},
				fail: (error) => {
					throw new Error(error);
				},
			});
		});
		let spanInfo =
			Object.prototype.toString.call(data) != "[object Array]"
				? "Listelenecek Kayıt Bulunamadı."
				: "";
		document.getElementById("tableInfoSpan").textContent = spanInfo;

		$(".btn-add").click(function () {
			let noteHeader = document.getElementsByClassName("form-control")[0].value;
			let noteDetail = document.getElementsByClassName("form-control")[1].value;

			if (noteHeader.trim == "" || noteDetail.trim() == "") {
				alert("Başlık ya da içerik boş bırakılamaz");
				throw new Error();
			}
			waitMe(true);
			Utility.setButtonReadOnly(true);
			var pushData = {
				noteHeader: noteHeader,
				noteDetail: noteDetail,
				noteDate:
					new Date().toLocaleDateString("tr-TR", {
						weekday: "short",
						year: "numeric",
						month: "short",
						day: "numeric",
					}) +
					" " +
					new Date().toLocaleTimeString("tr-TR"),
			};
			data.push(pushData);
			RealtimeDatabase.saveNotes({
				path: "note",
				params: data,
				done: (response) => {
					if (response) {
						waitMe(false);
						Utility.setButtonReadOnly(false);
						$(".btn-default").click();
					}
				},
				fail: (error) => {
					throw new Error(error);
				},
			});
		});

		$(".newNoteButton").click(function () {
			document.getElementById("noteHeader").value = "";
			document.getElementById("noteDetail").value = "";
		})

		$(".nextFindBtn").click(function () {
			if (findingCount < findingValuesPosition.length) {
				table.scrollViewportTo(findingValuesPosition[findingCount], 1);
				table.selectRows(findingValuesPosition[findingCount]);
				findingCount++;
			}
			else {
				findingCount = 0;
				$(".nextFindBtn").click();
			}
		});
	})

});