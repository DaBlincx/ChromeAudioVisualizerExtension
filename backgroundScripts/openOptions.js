function openOptions()
{
	var optionsUrl = chrome.extension.getURL("options/index.html");
	chrome.tabs.create({ url: optionsUrl });
}
