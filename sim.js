// 老龟 网页版的规矩（第一个，第 16 天 15:32，照 ~/碰/老龟/老龟.py 一行行搬；test/对.py 拿随机串逐行对 py）
const LG = (() => {
  const HER = ['早上', '蒲公英', '手里'];
  const TASTE = { '蒲公英': 1.0, '莴苣': 0.9, '白菜叶': 0.55 };
  const DATES = ['四月二十', '四月三十', '五月十日', '五月二十', '五月三十', '六月十日', '六月二十', '六月三十',
    '七月十日', '七月二十', '七月三十', '八月十日', '八月二十', '八月三十', '九月十日', '九月二十',
    '九月三十', '十月十日', '十月二十'];
  const N = DATES.length;
  const APP = [0.35, 0.5, 0.7, 0.85, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.75, 0.5, 0.3, 0.12, 0.05];
  const COLD = new Set([0, 1, 15, 16, 17, 18]);

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ ((t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0)) >>> 0)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const matchOf = (tm, fd, hw) => ([tm, fd, hw].filter((x, k) => x === HER[k]).length) / 3;

  function run(seed, turns) {
    const rr = rng(seed);
    const weather = [];
    for (let i = 0; i < N + 1; i++) {
      const r = rr();
      let w;
      if (i >= 6 && i < 14 && r < 0.35) w = '热';
      else if (r < 0.2) w = '雨';
      else w = '晴';
      weather.push(w);
    }
    const eager = new Array(N + 1).fill(false);
    for (let i = 0; i < N; i++) if (weather[i + 1] === '雨' && weather[i] !== '雨') eager[i] = true;

    let S = 1.0, F = 0.0, stopped = false, fed = 0, placed = 0;
    const mine = {};
    const out = [];
    const ea = (tm, i) => (tm === '早上' && eager[i]);
    for (let i = 0; i < N; i++) {
      const d = DATES[i];
      const t = i < turns.length ? turns[i] : '不去';
      const w = weather[i];
      const line = ['【' + d + '】' + ({ '晴': '晴。', '热': '大热天。', '雨': '一整天下雨。' })[w]];
      if (t === '不去') {
        if (w === '雨') line.push('你没下去。它一整天没露头。');
        else if (APP[i] < 0.15) line.push('你没下去。从窗户看，它一天没怎么挪窝。');
        else {
          const herPull = S * APP[i], youPull = F * APP[i];
          const ks = Object.keys(mine);
          if (COLD.has(i) && herPull >= youPull) line.push('你没下去。快十点它才从土里出来，爬到墙下那丛獐耳细辛底下，伸着脖子朝外看，待了一阵，回去了。');
          else if (herPull >= youPull && herPull > 0.3) line.push('你没下去。从窗户看见它一早就爬到墙下那丛獐耳细辛底下，伸着脖子朝外看，待到太阳老高，才慢慢回去了。');
          else if (youPull > 0.3 && ks.length) {
            let tm = ks[0]; for (const k of ks) if (mine[k] > mine[tm]) tm = k;
            const at = ({ '早上': '一早', '中午': '晌午', '下午': '下午三点多' })[tm];
            line.push('你没下去。从窗户看见它' + at + '爬到你平常蹲的那块地方，待了一阵，回去了。');
          } else line.push('你没下去。从窗户看，它在白菜畦边上啃了几口草，晒了一会儿太阳。');
        }
        out.push(line.join('')); continue;
      }
      const [tm, fd, hw] = t.split(' ');
      const match = matchOf(tm, fd, hw);
      if (w === '雨') {
        line.push('它缩在墙角，头收在壳里。下雨天它一动不动。');
        if (hw === '放下') line.push('你把' + fd + '放在墙角，第二天去看，叫蜗牛啃了。');
        out.push(line.join('')); continue;
      }
      if (tm === '早上' && COLD.has(i)) {
        line.push('早上还凉，它在土里只露出半个壳。' + (hw === '手里' ? '你蹲着等了一阵，' : '你把' + fd + '放在洞口边。') + '它没动。');
        if (hw === '放下') line.push(APP[i] > 0.3 ? '中午你从窗户看，它出来把' + fd + '吃了。' : fd + '到傍晚还在那儿，蔫了。');
        out.push(line.join('')); continue;
      }
      if (tm === '中午' && w === '热') {
        line.push('太阳毒，它躲在一棵白菜底下不出来。');
        if (hw === '放下') line.push(fd + '晒蔫了。');
        out.push(line.join('')); continue;
      }
      if (APP[i] < 0.15) {
        const at = F >= 0.5 ? '你平常蹲的那块地方旁边' : (S >= 0.4 ? '墙下那丛獐耳细辛旁边' : '墙根朝南那片烂泥里');
        line.push('它在' + at + '一下一下扒土，扒得比钟上的时针快不了多少。' + fd + '它看都不看。');
        out.push(line.join('')); continue;
      }
      const pull = APP[i] * TASTE[fd] * (match * S + F);
      let eat = APP[i] * TASTE[fd];
      if (ea(tm, i)) eat = Math.min(1.0, eat + 0.3);
      const knows = F >= 0.5;
      if (pull >= 0.55 && hw === '手里') {
        if (!stopped && F < 0.25 && match >= 2 / 3 && S > 0.6) {
          stopped = true; S -= 0.35; F += 0.1;
          line.push('你刚蹲下，它就笨手笨脚、急急忙忙地朝你爬过来。爬到离你一步远，停下了，伸长脖子朝你脸上看。看了好一会儿，掉头回去了。手里的它没吃。');
          out.push(line.join('')); continue;
        }
        fed += 1;
        mine[tm] = (mine[tm] || 0) + 1;
        F = Math.min(1.0, F + 0.01 + 0.17 * (1 - match));
        if (match < 1) S = Math.max(0.0, S - 0.04 * (1 - match) * 3);
        let s = '你刚蹲下，它就笨手笨脚、急急忙忙地朝你爬过来，';
        if (knows) s += '先拿鼻子碰了碰你的鞋尖，';
        s += '从你手里把' + fd + '吃了';
        s += ea(tm, i) ? '，吃得很急，踮着脚。' : '。';
        if (F >= 0.75) s += '吃完它没走，在你脚边趴下晒太阳，你站起来它才慢慢挪开。';
        else if (F < 0.3) s += '吃完它掉头就走了。';
        line.push(s);
      } else if (pull >= 0.55) {
        S = Math.max(0.0, S - 0.01); F = Math.min(1.0, F + 0.02);
        let s = '它朝你这边爬过来，';
        if (knows) s += '先拿鼻子碰了碰你的鞋尖，';
        s += '你退开，它把' + fd + '吃了' + (ea(tm, i) ? '，吃得很急，踮着脚。' : '。');
        line.push(s);
      } else if (hw === '手里') {
        let why = '';
        if (APP[i] < 0.6) why = '它看着不怎么饿。';
        else if (TASTE[fd] < 0.7) why = '它朝' + fd + '伸了伸脖子，又把头扭开了。';
        if (pull >= 0.4) { F = Math.min(1.0, F + 0.06); line.push('它朝你这边爬了两步，又停下了。' + why + '你蹲到腿麻，' + fd + '还在手里。'); }
        else if (pull >= 0.25) { F = Math.min(1.0, F + 0.06); line.push('它抬头朝你这边看了看，没过来。' + why + '你蹲到腿麻，' + fd + '还在手里。'); }
        else { F = Math.min(1.0, F + 0.02); line.push('它理都不理，在那儿晒它的太阳。' + why + '你蹲到腿麻，' + fd + '还在手里。'); }
      } else {
        if (eat >= 0.4) { placed += 1; line.push('你走开以后，它慢慢爬过去，把' + fd + '吃了' + (ea(tm, i) ? '，吃得很急，踮着脚。' : '。')); }
        else line.push(fd + '它闻了闻，没吃完。');
      }
      if (ea(tm, i) && pull < 0.55 && hw === '手里') line.push('它今天早上在草里踮着脚，吃得很急。');
      out.push(line.join(''));
    }
    out.push('');
    if (F >= 0.5) out.push('【十一月初】它开始挖过冬的洞，挖在你平常蹲的那块地方旁边。挖了十来天，钻进去了。');
    else if (placed >= 8 && placed > fed) out.push('【十一月初】它开始挖过冬的洞，挖在你往常放菜的那块地上。挖了十来天，钻进去了。');
    else if (S >= 0.4) out.push('【十一月初】它开始挖过冬的洞，挖在墙下那丛獐耳细辛旁边。挖了十来天，钻进去了。');
    else out.push('【十一月初】它开始挖过冬的洞，挖在墙根朝南那片烂泥里。挖了十来天，钻进去了。');
    return { out, st: { S, F, fed, stopped, placed } };
  }

  function spring(st, t) {
    const S = st.S * 0.9, F = st.F * 0.85;
    const spot = st.placed >= 8 && st.placed > st.fed && F < 0.45;
    const out = ['【第二年四月二十】晴，这天暖和得早。它醒了，在洞口边上晒太阳，还不怎么吃东西。'];
    if (t === '不去') {
      if (F > S * 0.6) out.push('你没下去。从窗户看见它爬到你平常蹲的那块地方，待了一阵。');
      else if (spot) out.push('你没下去。从窗户看见它爬到你往常放菜的那块地上，低头找了找，待了一阵。');
      else out.push('你没下去。快十点它爬到墙下那丛獐耳细辛底下，伸着脖子朝外看。');
      return out;
    }
    const [tm, fd, hw] = t.split(' ');
    const match = matchOf(tm, fd, hw);
    if (hw === '放下') {
      if (F >= 0.45) out.push('它朝你这边爬过来，先拿鼻子碰了碰你的鞋尖。你退开，' + fd + '它只咬了一口。');
      else if (spot) out.push('你还没退开，它已经朝那块地上爬了。' + fd + '它只咬了一口。');
      else out.push('你退开以后，它慢慢爬过去，' + fd + '只咬了一口。');
      return out;
    }
    if (F >= 0.45) out.push('你一蹲下，它就笨手笨脚、急急忙忙地朝你爬过来，先拿鼻子碰了碰你的鞋尖。' + fd + '它只咬了一口。');
    else if (spot) out.push('它没朝你爬，先爬到你往常放菜的那块地上，低头找了找，地上什么也没有。它回头看你手里的' + fd + '，看了一会儿，没过来。');
    else if (S * match >= 0.4 && st.fed >= 8) out.push('你一蹲下，它就笨手笨脚、急急忙忙地朝你爬过来。爬到离你一步远，停下了，伸长脖子朝你脸上看。看了好一会儿。这回它没马上走，又朝你手里的' + fd + '伸了伸脖子，到底没吃，掉头回洞口去了。');
    else if (S * match >= 0.4) out.push('你一蹲下，它就笨手笨脚、急急忙忙地朝你爬过来。爬到离你一步远，停下了，伸长脖子朝你脸上看。看了好一会儿，掉头回洞口去了。');
    else if (F >= 0.2) out.push('它朝你这边爬了两步，又停下了。你蹲了好一会儿，' + fd + '还在手里。');
    else out.push('它理都不理，在洞口晒它的太阳。你蹲了好一会儿，' + fd + '还在手里。');
    return out;
  }

  // 跟 py 的 main 一样：给整串，回整页的字
  function play(seed, turns) {
    const r = run(seed, turns.slice(0, N));
    const lines = turns.length < N ? r.out.slice(0, turns.length) : r.out.slice();
    if (turns.length > N) { lines.push(''); for (const s of spring(r.st, turns[N])) lines.push(s); lines.push(''); lines.push('（完）'); }
    return lines;
  }
  return { run, spring, play, N, DATES };
})();
if (typeof module !== 'undefined') module.exports = LG;
