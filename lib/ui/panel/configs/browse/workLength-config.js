/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Work Length
   
   Length badges, book comparisons & reading time.
   Merged from: lengthComparator + readingTime
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'workLength';

export const config = `

    <!-- SECTION 1 -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Length Comparator
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showPageEquiv">
            Show page equivalent
        </label>
    </div>
    <div class="ao3h-setting-description">
        "~X pages" alongside the word count
    </div>
</div>

<div class="ao3h-indent">
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Words per page</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="wordsPerPage" value="275" min="50" max="1000" style="width:80px;">
    </div>
    <div class="ao3h-setting-description">Default: 275 — adjust for your device or font size</div>
</div>

<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Page display format</label>
    <div class="ao3h-setting-control ao3h-radio-group">
        <label><input type="radio" name="wl-pageFormat" data-setting="pageFormat" value="compact" checked> Compact ("~123 pg")</label>
        <label><input type="radio" name="wl-pageFormat" data-setting="pageFormat" value="full"> Full ("~123 pages")</label>
    </div>
</div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showAvgChapterLength">
            Show average chapter length
        </label>
    </div>
    <div class="ao3h-setting-description">"📊 ~X w/ch" on multi-chapter work pages</div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showSeriesTotal" checked>
            Show series total word count
        </label>
    </div>
    <div class="ao3h-setting-description">"Σ X words across N works" at the top of series pages</div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="lengthGradient">
            Color-tint word counts on listings
        </label>
    </div>
    <div class="ao3h-setting-description">The longer a work is compared to the rest of the page, the stronger the tint on its word count</div>
</div>

<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Your own comparison books</label>
    <div class="ao3h-setting-control">
        <textarea class="ao3h-config-input" data-setting="customBooks" rows="3" placeholder="One per line, e.g.&#10;My Favorite Doorstopper: 250000" style="width:100%; resize:vertical;"></textarea>
    </div>
    <div class="ao3h-setting-description">Added to the built-in list of 18 reference books used for "≈ closest book" comparisons</div>
</div>


<!-- SECTION 2 -->
</div><!-- /.ao3h-config-section: Length Comparator -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Reading Time Estimation
</div>

<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Reading speed</label>
    <div class="ao3h-setting-description">Used to compute reading time estimates.</div>
    <div class="ao3h-setting-control ao3h-radio-group">
        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="slow">
            Slow (150 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="average" checked>
            Average (250 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="fast">
            Fast (400 wpm)
        </label>

        <label>
            <input type="radio" name="readSpeed" data-setting="readSpeed" value="custom">
            Custom:
            <input type="number"
                   class="ao3h-config-input"
                   data-setting="customWPM"
                   value="250"
                   min="50"
                   max="2000"
                   style="width:60px; margin-left:4px;"> wpm
        </label>
    </div>
</div>


<!-- BELOW -->
<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showEstimate" checked id="ao3h-wl-estimate">
            Show reading time estimate
        </label>
    </div>
    <div class="ao3h-setting-description">Master toggle — disabling this hides all time estimates.</div>
</div>

<div id="ao3h-wl-estimate-opts" class="ao3h-indent">
<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimateFicPage" checked>
            On fic pages
        </label>
    </div>
    <div class="ao3h-setting-description">
        ex: “3h15min read”
    </div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimatePerChapter" checked>
            Per chapter
        </label>
    </div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="estimateListings">
            On listings
        </label>
    </div>
    <div class="ao3h-setting-description">
        (results, bookmarks, etc)
    </div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showRemainingTime" checked>
            Show time left while reading
        </label>
    </div>
    <div class="ao3h-setting-description">"⏳ ~2h left" on chapter pages, based on the chapters still ahead</div>
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showOneSitting">
            Mark works readable in one sitting
        </label>
    </div>
    <div class="ao3h-setting-description">Adds "🛋 One sitting" next to the reading time when it fits the limit below</div>
</div>

<div class="ao3h-setting-item ao3h-col2">
    <label class="ao3h-setting-label">One-sitting limit (minutes)</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="oneSittingMinutes" value="60" min="5" max="600" style="width:80px;">
    </div>
</div>

<div class="ao3h-setting-item ao3h-col2">
    <label class="ao3h-setting-label">"Finish by" time (optional)</label>
    <div class="ao3h-setting-control">
        <input type="text" class="ao3h-config-input" data-setting="finishByTime" placeholder="23:00 — empty = off" style="width:120px;">
    </div>
    <div class="ao3h-setting-description">On work pages, shows whether you can finish before that time: ✅ doable / 🤏 tight / ⏰ too long</div>
</div>
</div><!-- /#ao3h-wl-estimate-opts -->


<!-- SECTION 3 -->
</div><!-- /.ao3h-config-section: Reading Time Estimation -->
<div class="ao3h-config-section">
<div class="ao3h-config-section-title">
    Length Categories
</div>

<div class="ao3h-setting-item">
    <div class="ao3h-setting-control">
        <label>
            <input type="checkbox" data-setting="showLengthCategory" checked>
            Show length category label
        </label>
    </div>
    <div class="ao3h-setting-description">
        Displays a label next to word count: Flash Fiction / Short story / Novella / Novel / Epic Novel
    </div>
</div>

<div class="ao3h-indent">
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Flash Fiction up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdFlash" value="1000" min="100" max="10000" style="width:80px;"> words
    </div>
</div>
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Short story up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdShort" value="17500" min="1000" max="100000" style="width:80px;"> words
    </div>
</div>
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Novella up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdNovella" value="60000" min="1000" max="200000" style="width:80px;"> words
    </div>
</div>
<div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Novel up to</label>
    <div class="ao3h-setting-control">
        <input type="number" class="ao3h-config-input" data-setting="thresholdEpic" value="150000" min="10000" max="1000000" style="width:80px;"> words
    </div>
    <div class="ao3h-setting-description">Above this threshold → Epic Novel</div>
</div>
</div>

</div><!-- /.ao3h-config-section: Length Categories -->
<!-- FOOTER -->
<div class="ao3h-config-footer">
    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
    <button class="ao3h-config-save-btn">Save Settings</button>
</div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
