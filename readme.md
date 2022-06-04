# Roll20 API and Sheet Auotuploader
This Chromium extension will automate the uploading of code to your Roll20 sheet sandbox or API page (API page functionality not yet available). This will streamline the creation of character sheets and API scripts for Roll20.
## Compatible Browsers
This extension is for chromium browsers. It should work on all chromium browsers except for Brave, which has disabled the chromium features that the extension relies on.
## Installing the Extension
In order to install the extension, you will need to use a chromium browser (Chrome, Edge, etc).

1. Download the `Extension` directory from the repository. Save this where you can find it on your computer. You may rename the directory if you want, but do NOT rename any of the contained files.
2. In your chromium browser, navigate to `chrome://extensions`. This will bring up a page listing your installed extensions.
3. On this page will be an option to "Enable Developer Mode". Toggle Developer mode on if it is not already.
4. This will display several additional options, one of which is to "Load unpacked". Click this and navigate to the directory where you have saved the `extension` directory. Select the `extension` directory and click `Select Folder`. The extension is now installed.
5. I recommend pinning the extension to the extension tray in your browser for easier access while working on conversion tasks.

## Using the Extension
Currently, the extension only works with sheet files. Once the extension is enabled in your sandbox, follow these steps to begin monitoring your code:

1. Click the `Select Directory` button in the modified sandbox tools container. A dialogue will appear asking you to select a directory to monitor. Make sure to select the directory that your HTML, CSS, and translation.json files are directly in (e.g. they are not in sub folders within the folder you select)
2. Your browser will prompt you with a security prompt to ensure you want the site to have access to the contents of the folder.
3. Your directory is now being monitored. The extension will have automatically selected the HTML, CSS, and translation.json files to monitor. If you have multiple versions of HTML or CSS files, you'll need to move the duplicates out of the directory to ensure that the proper file is used to update your sandbox.
4. Edit your code in your IDE of choice and save it as needed. The extension will update the sandbox each time that it detects a change. If a file is removed (e.g. deleted or renamed), the extension will update appropriately. The extension will work with generated HTML/CSS files from PUG, SCSS, or other templating languages as well.
5. If you need to change which directory you are monitoring, click the `Change Directory` button and repeat the steps outlined above.
## Extension Interfaces
### The Sheet Sandbox Monitor Status Panel
The extension modifies the normal Sheet Sandbox Tools dialog in your game to relay additional information.
#### Monitor Status bar
This bar will update based on which directory on your computer you are monitoring. After monitoring has begun it has an animated scan bar that will continue to animate back and forth across the bar as long as the extension is running properly. If this animation stops, then the extension has crashed.
#### Select/Change Directory Button
This button is how you direct the extension to a specific directory to monitor. The text in the button will update based on whether a directory is currently selected or not.
#### File Status Display
These three boxes, immediately below the directory button update you on which files are being used as the source of code for the sandbox. They will display the name of the file and be colored green if a file is present for that file type and there are no issues with the file. If there is no file for a given code type, or if the file has an error, the box will be colored yellow. If there is no file found for the type of code, the text will simply read `CSS`, `HTML`, or `Translation` depending on which file is missing.
#### Error Log
This section is hidden by default. It will display if there is a problem with the content of one of your files and will give details about what is wrong.
###### CSS Errors
CSS files can generate two types of errors related to the Roll20 sanitization system.
- Suspect Words Error: This error will display if one of the suspect words/phrases that are banned by the R20 parser is found in your code. The error log will specify which word(s) were found in your code so that you can more easily find them. Remember that these words trigger the sanitization even if they are inside another word (e.g. `eval` in `medieval`).
- High/Low Byte characters: The R20 sanitizer also reacts to characters with exceptionally high or low byte sizes. Currently, the error log will not specify which character was found in your code.
###### JSON Errors
There's really only one error on `translation.json` files that gets reported in the error log.
- Invalid JSON: This error means that your `translation.json` file could not be parsed. Check your file for errors, and run it through a JSON linter to quickly find any problems.
#### Update Log
This section will update with timestamped details about what updates the extension has made. This makes it easy to see when you last updated a specific file and to ensure that the extension is properly monitoring your files.
#### Sheet Default Settings Button
This is the original Roll20 button for this and works as described in the wiki.
## Data Privacy
The extension does not store any data collected from your computer between sessions. Once you close your browser, the extension loses all memory of what you did while it was running. The only place that the extension shares the data it collects while running is with the Roll20 site itself. It also only shares the specific files needed to update the Roll20 page. For the sheet sandbox, this is the html, css, and translation.json files indicated in the log.
## Changelog
### v1.2alpha
- Alpha release of API code auto upload
### v1.01
- Extension now allows selecting from multiple files in a folder and supports switching to language specific translation files in a `translations` subfolder
- Ability to pause monitoring
- Ability to force a reload of all files
- Removed the robot eye that showed the extension was functioning.
- Added error detection functionality that changes the color of the "monitoring" field if the extension crashes or the internet connection is lost. The update log will also get an entry if an error is detected.
### v1.00
- Fixed display error with long file names
- Changed scanning animation to be smoother
- Update Manifest Permissions to be accurate to what the extension actually uses (only `declarativeContent`)
- The extension no longer requires clicking on the extension's button in the extension tray