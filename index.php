<?php
require __DIR__ . '/config.php';
//$csrf = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf" content="<?php echo htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8'); ?>">
  <title>Management Development and Training Unit</title>
  <meta name="description" content="Training plans, nominations, scholarships, and staff records for the North Western Provincial Council.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600&family=Outfit:wght@500;650&family=Source+Sans+3:wght@400;600&display=swap">
  <link rel="stylesheet" href="app.css">
  <script>document.documentElement.dataset.theme = localStorage.getItem("mdtu-theme") || "light";</script>
</head>
<body>
  <a class="skip" href="#stage">Skip to content</a>
  <header class="gov-banner">
    <img src="images/national crest.gif" alt="National emblem">
    <div class="banner-title">
      <strong data-i18n="unit">කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය</strong>
      <span data-i18n="org">වයඹ පළාත් සභාව</span>
    </div>
    <img class="flag" src="images/pflag.PNG" alt="Wayamba provincial flag">
  </header>
  <div class="menubar">
    <div class="menu-line">
    <button class="menu-btn" id="menu" type="button">Menu</button>
    <nav class="nav" id="nav">
      <a data-nav href="#home" data-i18n="home">මුල් පිටුව</a>
      <a data-nav href="#programmes" data-i18n="programmes">පුහුණු වැඩසටහන්</a>
      <a data-nav href="#external" data-i18n="external">බාහිර පුහුණු පාඨමාලා</a>
      <a data-nav href="#directory" data-i18n="staff">කාර්යමණ්ඩලය</a>
      <a data-nav href="#downloads" data-i18n="downloads">බාගත කිරීම්</a>
      <a data-nav href="#about" data-i18n="about">අප ගැන</a>
      <a data-nav href="#contact" data-i18n="contact">අමතන්න</a>
      <a href="https://www.rticommission.lk/web/index.php?lang=en#" target="_blank" rel="noopener" data-i18n="rtiLink">RTI</a>
      <a href="https://ciaboc.gov.lk/" target="_blank" rel="noopener" data-i18n="briberyLink">අල්ලස පිටු දකිමු</a>
    </nav>
    </div>
    <div class="menu-tools">
    <div class="portals">
      <a href="https://mdtu.nw.gov.lk/spcnew/" target="_blank" rel="noopener">SPC</a>
      <a href="#register" data-i18n="lectureLogin">දේශක ලියාපදිංචිය</a>
      <a href="https://mdtu.nw.gov.lk/attandence/" target="_blank" rel="noopener" data-i18n="programLogin">ඇගයීම</a>
    </div>
    <div class="lang-switch">
      <button type="button" data-act="lang" data-lang="si">සිංහල</button>
      <button type="button" data-act="lang" data-lang="ta">தமிழ்</button>
      <button type="button" data-act="lang" data-lang="en">English</button>
    </div>
    <div class="theme-switch">
      <button type="button" data-act="theme" data-theme="light" data-i18n="themeLight">ලා</button>
      <button type="button" data-act="theme" data-theme="color" data-i18n="themeColor">වර්ණ</button>
      <button type="button" data-act="theme" data-theme="dark" data-i18n="themeDark">අඳුරු</button>
    </div>
    <div id="account"></div>
    </div>
  </div>
  <main id="stage"></main>
  <footer class="footer">
    <div class="wrap" id="foot-note" data-i18n="footer">© 2026 කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය - වයඹ පළාත් සභාව · +94 37 2222018</div>
    <p class="footer-credit">Web Developer and System Administrator · M. A. Wickramanayake (Development Officer) · E mail: <a href="mailto:anurasiri123@gmail.com">anurasiri123@gmail.com</a> · WhatsApp: <a href="https://wa.me/94774940944">0774940944</a></p>
  </footer>
  <script src="qrcode.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
