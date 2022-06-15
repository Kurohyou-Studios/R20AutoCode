<div id="top"></div>
<span align="center">

[![Contributors][contributors-shield]][contributors-url] [![Forks][forks-shield]][forks-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url] [![Patreon][patreon-shield]][patreon-url]

</span>
<!-- PROJECT LOGO -->
<br />
<div align="center">
<a href="https://github.com/Kurohyou-Studios/R20AutoCode">
<img src="assets/images/logo.png" alt="Logo" width="80" height="80">
</a>
<h3 align="center">Roll20 API and Sheet Code Autouploader</h3>
<p align="center">
This Chromium extension will automate the uploading of code to your Roll20 sheet sandbox or API page (API page functionality is in Alpha testing). This will streamline the creation of character sheets and API scripts for Roll20.
<br/>
<a href="https://github.com/Kurohyou-Studios/R20AutoCode"><strong>Explore the docs »</strong></a>
<br/>
<br/>
<a href="https://github.com/Kurohyou-Studios/R20AutoCode/issues">Report Bug</a>
·
<a href="https://github.com/Kurohyou-Studios/R20AutoCode/issues">Request Feature</a>
</p>
</div>
<!-- TABLE OF CONTENTS -->
<details>
<summary>Table of Contents</summary>
<ol>
<li>
<a href="#about-the-project">About The Project</a>
<ul>
<li><a href="#built-with">Built With</a></li>
</ul>
</li>
<li>
<a href="#getting-started">Getting Started</a>
<ul>
<li><a href="#prerequisites">Prerequisites</a></li>
<li><a href="#installation">Installation</a></li>
</ul>
</li>
<li><a href="#usage">Usage</a></li>
<li><a href="#roadmap">Roadmap</a></li>
<li><a href="#contributing">Contributing</a></li>
<li><a href="#license">License</a></li>
<li><a href="#contact">Contact</a></li>
<li><a href="#acknowledgments">Acknowledgments</a></li>
</ol>
</details>
<!-- ABOUT THE PROJECT -->

## About The Project
<span align="center">

[![Product Name Screen Shot][product-screenshot]][product-screenshot]

</span>

Back when the sheet sandbox was first released, I had asked Kenton why the sheet sandbox couldn't simply monitor a directory and automatically update the sandbox when the html, css, or translation.json files changed. Back then, this wasn't possible as browsers don't generally have live access to the file system of a user's computer. That changes today with the release of v1.0 of the Roll20 API and Sheet Autouploader! You can also find the source code on github.

v1.21Alpha of the autouploader also works on API scripts!
<p align="right">(<a href="#top">back to top</a>)</p>

### Built With
- HTML
- CSS
- JS
- JQuery
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- GETTING STARTED -->

## Getting Started
### Prerequisites
This extension is for chromium browsers. It should work on all chromium browsers except for Brave, which has disabled the chromium features that the extension relies on.
### Installation
In order to install the extension, you will need to use a chromium browser (Chrome, Edge, etc). The current live, stable version of the script can be added to any chromium browser via the [extension's chrome web store page](https://chrome.google.com/webstore/detail/roll20-api-and-sheet-auto/hboggmcfmaakkifgifjbccnpfmnegick?hl=en). If you want to use the raw code or use an Alpha or Beta version of the code, follow the directions below.

1. Navigate to the branch for the version you want to use.
2. Download the `Extension` directory from the repository. Save this where you can find it on your computer. You may rename the directory if you want, but do NOT rename any of the contained files.
3. In your chromium browser, navigate to `chrome://extensions`. This will bring up a page listing your installed extensions.
4. On this page will be an option to "Enable Developer Mode". Toggle Developer mode on if it is not already.
5. This will display several additional options, one of which is to "Load unpacked". Click this and navigate to the directory where you have saved the `extension` directory. Select the `extension` directory and click `Select Folder`. The extension is now installed.
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- USAGE EXAMPLES -->

## Usage
Once the extension is enabled in your sandbox, follow these steps to begin monitoring your code:
### Syncing sheet files
1. Click the `Select Directory` button in the modified sandbox tools container. It is the button with the folder icon with an up arrow in it. A dialogue will appear asking you to select a directory to monitor. Make sure to select the directory that your HTML, CSS, and translation.json files are directly in (e.g. they are not in sub folders within the folder you select)
2. Your browser will prompt you with a security prompt to ensure you want the site to have access to the contents of the folder.
3. Your directory is now being monitored. The extension will have automatically selected the HTML, CSS, and translation.json files to monitor. If you have multiple versions of HTML or CSS files, you'll need to move the duplicates out of the directory to ensure that the proper file is used to update your sandbox.
4. Edit your code in your IDE of choice and save it as needed. The extension will update the sandbox each time that it detects a change. If a file is removed (e.g. deleted or renamed), the extension will update appropriately. The extension will work with generated HTML/CSS files from PUG, SCSS, or other templating languages as well.
5. If you need to change which directory you are monitoring, click the `Change Directory` button and repeat the steps outlined above.
### Syncing API files
#### Selecting a directory
1. Click the `Add a new directory` button in the modified sandbox tools container. It is the button with the folder icon with a plus sign in it. A dialogue will appear asking you to select a directory to monitor. Select a directory that contains the js files you want to monitor or contains directories that contain js files you want to monitor
2. Your browser will prompt you with a security prompt to ensure you want the site to have access to the contents of the folder.
3. Your directory is now being monitored. The extension will search up to 5 levels deep for js files that match the scripts that have been added to the game's sandbox. Currently, multiple versions of a script cannot be selected from, but the script will select the version specified in the script.json file of a script's directory, otherwise, it will simply select the first iteration of that file that it finds.
4. Repeat the above steps to add additional directories, the extension can monitor multiple directories. In the current alpha state, a directory cannot be removed from monitoring.
#### Adding additional scripts
1. Select a directory as described above if one is not already selected. The text input and button at the end of the scripts list will become enabled.
2. Type the file name into the input at the end of the script list (case sensitive and including the `.js`).
3. Click the `file upload` button (page icon with an up arrow in it). The script will be added to the sandbox, and if a file matching that script is in the currently monitored directory, the code will be sync'd.
4. Repeat as needed to add additional files for syncing
#### Deleting scripts from the sandbox
1. Click the script's header in the list of scripts.
2. Click the `Delete Script` button that appears on the right side. This will remove the script from the sandbox and stop the extension from syncing that script with the sandbox. It will not affect the file on your computer.
#### Disabling/enabling a script
1. Click the script's header in the list of scripts.
2. Click the `Disable Script` or `Enable Script` button that appears on the left (depending on the script's current state). 
3. If a script is disabled, it will no longer run in the sandbox. Additionally, the code will not be sync'd between your computer and the sandbox while the script is disabled. Reenable the script to have it run in the game and sync with the associated file on your computer.
### Sheet Sandbox Extension Interfaces
#### The Sheet Sandbox Monitor Status Panel
The extension modifies the normal Sheet Sandbox Tools dialog in your game to relay additional information.
##### Monitor Status bar
This bar will update based on which directory on your computer you are monitoring. After monitoring has begun it has an animated scan bar that will continue to animate back and forth across the bar as long as the extension is running properly. If this animation stops, then the extension has crashed.
##### Select/Change Directory Button
This button is how you direct the extension to a specific directory to monitor. The text in the button will update based on whether a directory is currently selected or not.
##### File Status Display
These three boxes, immediately below the directory button update you on which files are being used as the source of code for the sandbox. They will display the name of the file and be colored green if a file is present for that file type and there are no issues with the file. If there is no file for a given code type, or if the file has an error, the box will be colored yellow. If there is no file found for the type of code, the text will simply read `CSS`, `HTML`, or `Translation` depending on which file is missing.
##### Error Log
This section is hidden by default. It will display if there is a problem with the content of one of your files and will give details about what is wrong.
**CSS Errors**
CSS files can generate two types of errors related to the Roll20 sanitization system.
- Suspect Words Error: This error will display if one of the suspect words/phrases that are banned by the R20 parser is found in your code. The error log will specify which word(s) were found in your code so that you can more easily find them. Remember that these words trigger the sanitization even if they are inside another word (e.g. `eval` in `medieval`).
- High/Low Byte characters: The R20 sanitizer also reacts to characters with exceptionally high or low byte sizes. Currently, the error log will not specify which character was found in your code.
**JSON Errors**
There's really only one error on `translation.json` files that gets reported in the error log.
- Invalid JSON: This error means that your `translation.json` file could not be parsed. Check your file for errors, and run it through a JSON linter to quickly find any problems.
##### Update Log
This section will update with timestamped details about what updates the extension has made. This makes it easy to see when you last updated a specific file and to ensure that the extension is properly monitoring your files.
##### Sheet Default Settings Button
This is the original Roll20 button for this and works as described in the wiki.

### API Sandbox Extension Interfaces
#### Directory Controls
The three buttons underneath the instructions paragraph allow you to pause/resume all syncing, add directories to be monitored, and force a resync respectively.
#### Directory Status
Under the directory controls, a list of all directories that are being monitored will appear. The directories are color coded green or yellow based on their sync status. Green means the directory is syncing properly. Yellow means there is a problem with the directory.
#### Update Log
A log of all sync operations and status updates for the session will appear here with timestamps.
<p align="right">(<a href="#top">back to top</a>)</p>

## Data Privacy
The extension does not store any data collected from your computer between sessions. Once you close your browser, the extension loses all memory of what you did while it was running. The only place that the extension shares the data it collects while running is with the Roll20 site itself. It also only shares the specific files needed to update the Roll20 page. For the sheet sandbox, this is the html, css, and translation.json files indicated in the log.
<!-- ROADMAP -->
## Roadmap
Roadmap
See the [open issues](https://github.com/Kurohyou-Studios/R20AutoCode/issues) for a full list of proposed features (and known issues).
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- CONTRIBUTING -->

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- LICENSE -->

## License
Distributed under the MIT License. See [LICENSE.txt](LICENSE.txt) for more information.
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- CONTACT -->

## Contact
Scott Casey - [@Kurohyoustudios](https://twitter.com/Kurohyoustudios) - scaseydv@gmail.com
Project Link: [https://github.com/Kurohyou-Studios/R20AutoCode](https://github.com/Kurohyou-Studios/R20AutoCode)
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- ACKNOWLEDGMENTS -->

## Acknowledgments
Thank you to all the Roll20 community that inspired this extensions. Particularly
- Oosh For answering my questions on how to extract information from roll20.net
- [Aaron](https://github.com/shdwjk) For all the question answering and mentoring
- [Keith](https://github.com/keithcurtis1) For Testing and design feedback
- [Andreas](https://github.com/Anduh) For Testing and design feedback
<p align="right">(<a href="#top">back to top</a>)</p>
<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Kurohyou-Studios/R20AutoCode.svg?style=flat
[contributors-url]: https://github.com/Kurohyou-Studios/R20AutoCode/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Kurohyou-Studios/R20AutoCode.svg?style=flat
[forks-url]: https://github.com/Kurohyou-Studios/R20AutoCode/network/members
[stars-shield]: https://img.shields.io/github/stars/Kurohyou-Studios/R20AutoCode.svg?style=flat
[stars-url]: https://github.com/Kurohyou-Studios/R20AutoCode/stargazers
[issues-shield]: https://img.shields.io/github/issues/Kurohyou-Studios/R20AutoCode.svg?style=flat
[issues-url]: https://github.com/Kurohyou-Studios/R20AutoCode/issues
[license-shield]: https://img.shields.io/github/license/Kurohyou-Studios/R20AutoCode.svg?style=flat
[license-url]: https://github.com/Kurohyou-Studios/R20AutoCode/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/Kurohyou-Studios
[patreon-shield]: https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dkurohyoustudios%26type%3Dpatrons&style=flat
[patreon-url]: https://patreon.com/kurohyoustudios
[product-screenshot]: assets/images/demo.gif