const creditsHTML = `
        <h3 id="creditTitle" style="background-color:plum;color:black;">CREDITS · COLOPHON</h3>
        <p>
          This website's front end was designed and hand-coded by 
          <a href="https://www.naisyuanye.com" target="_blank">Nai-Syuan Ye (cherrythehuman)</a> ☁︎☁︎☁︎.  
          <a href="https://pochunyeh.com" target="_blank">Po-Chen Yeh</a> and Po-Yu Yeh are the back-end developer and assistant.  
          This site was muddily coded between Arnhem and Taipei (2025–2026), with frequent coffee refills, oolong milk tea overflows, sweat, and occasional typos. Conceptualized under the blinding light of too many browser tabs, memes from all eras, books & newspapers from my studio shelf, friends’ shelves, and secondhand stores. 
          The structure, zine wall, timeline, calendar, and all the random functions were custom-built for the Taipei Art Book Fair — with love. Built with lavender-vanilla HTML, CSS, and JS.  
        </p>


        <p>
          Crafted in VS Code and Cursor on macOS and Linux Fedora KDE Plasma. Tested across Chrome, Firefox, and Safari (sometimes reluctantly).<br>
          Hosted on <a href="https://github.com/taipeiartbookfair-doublegrass" target="_blank">GitHub Pages</a>, with DNS witchcraft through domainzoo.
        </p>
        
       <p><strong>Open-source fonts in use</strong>: <span>Inclusive Sans (Google Fonts), BioRhyme Expanded (Google Fonts), Libre Franklin (Google Fonts), Montserrat (Google Fonts), Alice (Google Fonts), Instrument Serif (Google Fonts), IBM Plex Sans (Google Fonts), IBM Plex Sans JP (Google Fonts), IBM Plex Mono (Google Fonts), Poppins (Google Fonts), PicNic (velvetyne), Fungal-Grow (velvetyne)</span></p>

        <p>
          <span style="text-decoration: underline;">Special thanks</span> to 
          <a href="https://www.dogagonullu.nl/" target="_blank">Doğa Gönüllü</a>, 
          <a href="https://www.merlefindhammer.com" target="_blank">Merle Findhammer</a>, 
          <a href="https://www.instagram.com/frozen1900_/" target="_blank">Yuxin Hu</a>, 
          <a href="https://davides.net/" target="_blank">David Martinez</a>, 
          <a href="https://www.polinaslavova.com" target="_blank">Polina Slavova</a>, 
          <a href="https://janinezielman.com/" target="_blank">Janine Zielman</a>, 
          <a href="https://www.instagram.com/yochristineoy/" target="_blank">Chuan-Yun, Hsieh</a>, 
          <a href="https://polinatitova.nl/" target="_blank">Polina Titova</a>, 
          <a href="https://pascalburgers.nl/" target="_blank">Pascal Burgers</a>, 
          <a href="https://yaodejn.com/" target="_blank">Yaode JN</a>,
          Canavar, Threecups, Salmon, Hanji, all our family and friends — for being my eyes, adding their quirks, providing emotional support and food, and bearing with my messy coding schedule/chaotic hive mind;  
          to all the tools, software, hardware, power cables and computers, w3schools, MDN Web Docs, all kinds of AI, people on Reddit, StackOverflow, GitHub, and other forums that supported the process along the way;  
          The musics, night markets, de Rijn, electronic shops, viruses and ads that vibe my code and feed my soul; The Beatles; The hoomans who build the internet; My pillows and my house plants; 
          and of course, to the entire Taipei Art Book Fair team (especially Frank, Xavia, and Shao) for their support, guidance, and for giving me the freedom to build such a lovely and chaotic website <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"><3</span>
        </p>

        <p><strong>Cat pic as lucky charm<span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">:3</span></strong><br>
        <img src="image/canavar.jpeg" alt="Cat" style="width: 100px; height: auto; border:1px solid plum;">
      </p>

        <p>
          Version 1.0 · Published October 2025 · Updated sporadically when inspiration (or panic) strikes.<br>
          © 2025 Taipei Art Book Fair
        </p>
`;

// 當頁面載入完成後，自動插入 credits 內容
document.addEventListener('DOMContentLoaded', function() {
  const creditPanel = document.getElementById('creditPanel');
  if (creditPanel) {
    creditPanel.innerHTML = creditsHTML;
  }
});

