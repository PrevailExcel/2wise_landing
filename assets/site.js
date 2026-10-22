/* 2Wise site: tiny, no dependencies. */
(function () {
  var nav = document.querySelector('.nav')
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8) }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    var btn = nav.querySelector('.menu-btn')
    if (btn) btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', open)
    })
  }

  // Referral: ?ref=CODE from a friend's brag link rides along to the app, so they get credit.
  var ref = null
  try {
    ref = new URLSearchParams(location.search).get('ref')
    if (ref) localStorage.setItem('2wise.ref', ref); else ref = localStorage.getItem('2wise.ref')
  } catch (e) { /* private mode */ }
  if (ref) {
    document.querySelectorAll('a[href^="https://app.2wise.com.ng"]').forEach(function (a) {
      var u = new URL(a.href); u.searchParams.set('ref', ref); a.href = u.toString()
    })
  }

  // ── Platforms ─────────────────────────────────────────────────────────
  // Every visitor gets one obvious button for the device they're on, and
  // every other platform one tap away. File names, versions and sizes come
  // from /download/downloads.json (written by release/update-downloads.py);
  // a platform with no file yet falls back to the web app, never a dead link.
  var APP = 'https://app.2wise.com.ng'
  var ua = navigator.userAgent
  var isIpadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  var OS = /Android/i.test(ua) ? 'android'
    : (/iPhone|iPad|iPod/.test(ua) || isIpadOS) ? 'ios'
    : /CrOS/.test(ua) ? 'web'
    : /Windows/.test(ua) ? 'windows'
    : /Macintosh|Mac OS X/.test(ua) ? 'mac'
    : /Linux/.test(ua) ? 'linux' : 'web'
  document.documentElement.setAttribute('data-os', OS)

  var I = window.__ICONS || {}
  var ico = function (n) { return I[n] ? '<svg class="i" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">' + I[n] + '</svg>' : '' }
  var P = {
    android: { name: 'Android', key: 'android', icon: 'android-logo', get: 'Download for Android', short: 'Get the app' },
    windows: { name: 'Windows', key: 'windows', icon: 'windows-logo', get: 'Download for Windows', short: 'Get the app' },
    linux:   { name: 'Linux', key: 'linux_appimage', icon: 'linux-logo', get: 'Download for Linux', short: 'Get the app' },
    ios:     { name: 'iPhone & iPad', icon: 'apple-logo', web: true, get: 'Open 2Wise in Safari', short: 'Open app' },
    mac:     { name: 'Mac', icon: 'apple-logo', web: true, get: 'Open 2Wise on your Mac', short: 'Open app' },
    web:     { name: 'Web', icon: 'globe', web: true, get: 'Start free in your browser', short: 'Start free' }
  }
  var me = P[OS]

  function fileOf(m, key) { var f = m && m.platforms && m.platforms[key]; return f && f.file ? f : null }

  function applyCtas(m) {
    var hasApp = !me.web && fileOf(m, me.key)
    document.querySelectorAll('[data-get]').forEach(function (a) {
      var mode = a.getAttribute('data-get') // long | short | keep
      var lbl = a.querySelector('.lbl')
      if (hasApp) {
        a.href = '/download/?get=' + OS
        if (lbl && mode !== 'keep') lbl.innerHTML = ico(me.icon) + ' ' + (mode === 'short' ? me.short : me.get)
      } else if (me.web && mode === 'long' && lbl) {
        lbl.innerHTML = ico(me.icon) + ' ' + me.get
      }
    })
    // "Also on" row: every platform, yours highlighted.
    document.querySelectorAll('[data-platform-row]').forEach(function (row) {
      row.innerHTML = '<span class="also-lbl">Also on</span>' + ['android', 'windows', 'linux', 'web', 'ios', 'mac'].map(function (k) {
        var p = P[k]
        return '<a class="also' + (k === OS ? ' me' : '') + '" href="/download/#' + k + '" title="2Wise for ' + p.name + '">' + ico(p.icon) + '<span>' + (k === 'web' ? 'Web' : k === 'ios' ? 'iPhone' : p.name) + '</span></a>'
      }).join('')
    })
  }

  function applyDownloadPage(m) {
    var mine = document.getElementById('dl-mine')
    if (!mine) return
    var plats = m && m.platforms || {}
    // Versions, sizes and missing files on every card
    document.querySelectorAll('[data-file]').forEach(function (a) {
      var f = plats[a.getAttribute('data-file')]
      if (f && f.file) {
        a.href = '/download/' + f.file + (f.version ? '?v=' + encodeURIComponent(f.version) : '')
        a.setAttribute('download', '')
      } else {
        a.classList.add('soon'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true')
        a.innerHTML = a.textContent.trim() + ' · coming soon'
      }
    })
    document.querySelectorAll('[data-meta]').forEach(function (el) {
      var f = plats[el.getAttribute('data-meta')]
      if (f && f.version) el.textContent = 'Version ' + f.version + (f.size_mb ? ' · ' + f.size_mb + ' MB' : '')
    })
    var hashes = Object.keys(plats).filter(function (k) { return plats[k].sha256 }).map(function (k) { return k + ': ' + plats[k].sha256 })
    var h = document.getElementById('hashes'); if (h && hashes.length) h.textContent = 'SHA-256 checksums · ' + hashes.join(' · ')

    // Your device first
    var card = document.getElementById(OS === 'web' ? 'web' : OS)
    if (card) { card.classList.add('mine'); card.parentNode.insertBefore(card, card.parentNode.firstChild) }

    var f = !me.web && fileOf(m, me.key)
    document.getElementById('dl-title').textContent = '2Wise for ' + me.name
    document.getElementById('dl-mine-ic').innerHTML = ico(me.icon)
    document.getElementById('dl-mine-name').textContent = me.web ? '2Wise in your browser' : '2Wise for ' + me.name
    document.getElementById('dl-mine-meta').textContent = f
      ? 'Version ' + f.version + (f.size_mb ? ' · ' + f.size_mb + ' MB' : '') + ' · Free'
      : me.web ? 'Nothing to download. Works offline once added.' : 'Coming very soon. Use the web app meanwhile.'
    var btn = document.getElementById('dl-mine-btn')
    if (f) { btn.href = '/download/' + f.file; btn.setAttribute('download', ''); btn.querySelector('.lbl').innerHTML = ico('download-simple') + ' ' + me.get }
    else { btn.href = APP + '/auth'; btn.querySelector('.lbl').innerHTML = ico('globe') + ' ' + (me.web ? me.get : 'Use the web app') }
    mine.hidden = false

    // Install steps for this device, lifted from its card
    var steps = document.querySelector('[data-steps="' + (OS === 'web' ? 'web' : OS) + '"]')
    if (steps) {
      document.getElementById('dl-steps').innerHTML = steps.innerHTML
      document.getElementById('dl-steps-title').textContent = me.web ? 'How to add 2Wise to your ' + (OS === 'ios' ? 'Home Screen' : OS === 'mac' ? 'Dock' : 'browser') : 'How to install on ' + me.name
      document.getElementById('dl-steps-wrap').hidden = false
    }

    // Arrived from a "Download for …" button: start the download, show the steps.
    var want = new URLSearchParams(location.search).get('get')
    if (want && want === OS && f) {
      var st = document.getElementById('dl-status')
      st.innerHTML = 'Your download is starting. If it doesn\'t, <a href="/download/' + f.file + '" download>tap here</a>.'
      st.hidden = false
      setTimeout(function () { location.href = '/download/' + f.file }, 700)
    }
  }

  fetch('/download/downloads.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null })
    .catch(function () { return null })
    .then(function (m) { applyCtas(m); applyDownloadPage(m) })

  // Target-score planner: a starting plan. The app re-plans after the first mock.
  var range = document.getElementById('target')
  if (range) {
    var $ = function (id) { return document.getElementById(id) }
    var update = function () {
      var t = +range.value
      range.style.setProperty('--p', ((t - range.min) / (range.max - range.min) * 100) + '%')
      $('t-val').textContent = t
      var mins = Math.round(Math.min(75, Math.max(25, 25 + (t - 200) * 0.32)) / 5) * 5
      var qs = Math.round(Math.min(60, Math.max(20, t / 6)) / 5) * 5
      var mocks = t >= 300 ? 2 : 1
      $('p-mins').textContent = mins + ' minutes a day'
      $('p-qs').textContent = qs + ' practice questions a day'
      $('p-mock').textContent = mocks === 2 ? '2 full mocks a week' : '1 full mock a week'
      $('p-tag').textContent = t >= 320 ? 'Top-of-the-class plan' : t >= 270 ? 'Competitive-course plan' : t >= 220 ? 'Solid admission plan' : 'Get-over-the-line plan'
    }
    range.addEventListener('input', update); update()
  }

  // Footer year
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear()
})()
