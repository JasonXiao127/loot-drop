#  Loot Drop - The Epic Games Free Game Tracker 

**Live Site:** [jasonxiao127.github.io/loot-drop/](https://jasonxiao127.github.io/loot-drop/)

Update:
  Epic games has finally woken up and now has a 12 month roadmap to fix their craptastic launcher. Hurray!? 

A lightweight, bloat-free static website that automatically tracks and displays the current 100% off weekly free games from the Epic Games Store. 

##  Why build this?
If you're like me, you just want to know what the weekly free games are without having to boot up the heavy, resource-intensive Epic Games / Unreal Engine launcher. This project exists to solve that. It’s a fast, instant-loading webpage that gives you exactly the information you want—no client updates, no background processes, and no bloat.

##  Features
* **Zero Bloat:** Pure HTML, CSS, and vanilla JavaScript. Loads instantly.
* **Always Up to Date:** Data is fetched automatically every week.
* **100% Free Games Only:** Filters out standard discounts and only shows games that are currently given away for free.

##  How it Works 
There is a static web page that displays json file that is updated weekly by github actions. In doing so, I can avoid hosting costs by using github pages.

##  Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend/Data:** Python (Requests)
* **Continous Deployment:** GitHub Actions
* **Hosting:** GitHub Pages

---
