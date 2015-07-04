var initSceneManager = function(scenes)
{
    g.sceneManager = new SceneManager(scenes, g.sceneSelector);
	canvasResize();
	system = new System();
	try
	{
		g.sceneManager.init(system);
	}
	catch(e)
	{
		console.log("exception in initScenemgr");
		console.error(e);
	}
},
initScenes = function(savedPresets)
{
	g.sceneSelector = new SceneSelector();
	g.customSceneHandler = new CustomSceneHandler(g.sceneSelector);
	g.customSceneHandler.refreshCustomScenes(savedPresets);
    var scenes = {};
    for(var sceneName in AudioScenes)
    {
		aLog("found scene: "+sceneName, 1);
        var scene = new AudioScenes[sceneName];
		scene.originalName = scene.name;
        g.sceneSelector.insertActualScene(scene.name);
        scenes[scene.name] = scene;
    }
	return scenes;
},

initGUI = function()
{
	//init
	initStatsLibrary();
	var datGUI = initDatGUI();
	var gui = new GUI(datGUI);

	//adding Options Folder
	var optionsFolder = gui.appendFolder("Options");
    optionsFolder.addSetting(OV, "ShowFps").onChange(
		function(newValue)
		{
			storage.options.setOption("ShowFps", newValue);
		}
	);
    optionsFolder.addSetting(OV, "transparentBackground").onChange(
		function(newValue)
		{
			storage.options.setOption("transparentBackground", newValue);
		}
	);
	var optionsBtnConfig = buttonHandler.makeButton("-->Options",
		function()
		{
			g.port.postMessage(AV.openOptions);
		}
	);
	var optionsBtnElem = optionsFolder.addSetting(optionsBtnConfig, "-->Options");

	//adding Save Folder
	var saveFolder = gui.appendFolder("Save");
	saveFolder.addSetting(g, 'saveSceneName');
	var saveBtnConf = buttonHandler.makeButton("-->Save", saveButtonCallback);
	var saveBtnElem = saveFolder.addSetting(saveBtnConf, "-->Save");

	//adding Scene-Settings Folder
	gui.appendFolder("Scene-Settings");

	//adding scene selection drop down
	gui.repopulateSceneList();

	g.gui = gui;
},
saveButtonCallback = function()
{
	var cBack = function()
	{
		g.customSceneHandler.saveCustomScene(g.sceneManager.currentScene);
	}
	//make sure savename not occupado
	setSaveName(cBack);
},

initCanvas = function(contextStr)
{
	var className = "lerret";
	deleteDomClass(className);
	g.canvas = document.createElement('canvas');
	g.canvas.style.zIndex = OV.canvasZIndex;
	g.canvas.style.position = "absolute";
	g.canvas.style.border = "0px";
	g.canvas.style.pointerEvents = "none";
	g.canvas.className = className;
	document.body.appendChild(g.canvas);
    g.ctx = g.canvas.getContext(contextStr);
	return g.ctx;
},

initDatGUI=function()
{
	deleteDomClass("dg ac");
    var datGUI = new dat.GUI();

	g.datStyle = document.getElementsByClassName("dg ac")[0].style;
	g.datStyle.zIndex = OV.canvasZIndex+1;

	return datGUI;
},

initStatsLibrary=function()
{
	deleteDomById("stats");

	g.stats = new Stats();
	g.stats.setMode(0); // 0: fps, 1: ms

	g.stats.domElement.style.position = 'absolute';
	g.stats.domElement.style.zIndex = OV.canvasZIndex+1;
	document.body.appendChild( g.stats.domElement );
},
startup = function(savedPresets)
{
	aLog("init begun");
	initCanvas("2d");

	var scenes = initScenes(savedPresets);
	g.sceneSelector.setRandomScene();
	initGUI();
	initSceneManager(scenes);
	aLog("init finished, beginning sceneManager.update", 1);
	setFps(OV.ShowFps);
    g.sceneManager.update();
},
init = function()
{
	var i = function(attribName, value){
		initUndef(window.g, attribName, value);
	};
	//init window.g.attributes
	i("canvas", null);
	i("ctx", null);
	i("byteFrequency", [0]);
	i("pause", false);
	i("sceneManager",  null);
	i("datStyle", null);
	i("sceneSelector", null);
	i("saveSceneName", "not_set");
	i("gui",null);
	storage.options.init(window.OV,
	function(){
		storage.scenes.get(
		function(savedPresets)
		{
			i("frequencyBinCount",OV.fftSize/2);
			startup(savedPresets);
		});
	});
};

//Invoked at script injection time
(function(){
	chrome.runtime.onConnect.addListener(
		function(port){
			initUndef(window, 'g', {});
			g.port = port;
			port.onMessage.addListener(
				function(msg) {
					g.byteFrequency = msg;
				}
			);
		}
	);
})();
//<---
