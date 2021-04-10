/* because IE */
Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}

/* because me lazy */
Object.getOwnPropertyNames(Math).map(function(p) {
  window[p] = Math[p];
});

Node.prototype.setAttrs = function(attr_obj) {
  for(var prop in attr_obj) {
    this.setAttribute(prop, attr_obj[prop]);
  }
};

var NS_URI = 'http://www.w3.org/2000/svg', 
    XLink_NS = 'http://www.w3.org/1999/xlink', 
		
		ns = 60, 
		mi = 5, 
		qi = .25*ns, 
		r = ~~document.getElementById('cc').getAttribute('r'),
		svg = document.querySelector('svg'), 
		wrap = document.getElementById('ticks'), 
		h_el = document.querySelector('.hand--h'), 
		m_el = document.querySelector('.hand--m'), 
		s_el = document.querySelector('.hand--s'), 
		h_max = 12, h_rad = 2*PI/h_max, h_deg = 360/h_max, 
		m_max = 60, m_rad = 2*PI/m_max, m_deg = 360/m_max, 
		s_max = 60, s_rad = 2*PI/s_max, s_deg = 360/s_max, 
		ms_max = 1000, ms_rad = s_rad/ms_max, ms_deg = s_deg/ms_max, 
		prev_s, 
		p_el = document.getElementById('progress'), 
		a_el = document.getElementById('arc'), 
		v_el = document.getElementById('vertex'),
		arc_r = -1*v_el.getAttribute('points').split(' ')[0].split(',')[1], 
		clockwise = true;

var init = function () {
	var frag = document.createDocumentFragment(), 
			curr_tick_group, curr_tick, text0, text1, 
			is_major, is_quad, ref, 
			curr_angle, base_angle = 360/ns, bb;
	
	for(var i = 0; i < ns; i++) {
		is_major = (i%mi === 0);
		is_quad = (i%qi === 0);
		
		ref = '#mark--' + (is_major ? 'major' : 'minor');
		curr_angle = i*base_angle
		
		curr_tick_group = document.createElementNS(NS_URI, 'g');
		curr_tick = document.createElementNS(NS_URI, 'use');
		curr_tick.setAttributeNS(XLink_NS, 'xlink:href', ref);
		
		curr_tick.setAttribute(
			'transform', 
			'rotate(' + curr_angle + ')' + 
			'translate(0 -' + r + ')'
		);
		
		if(is_major) {
			curr_tick.setAttribute('class', 'major');
			
			text1 = document.createElementNS(NS_URI, 'text');
			text1.textContent = i;
			
			text1.setAttribute(
				'transform', 
				'rotate(' + curr_angle + ')' + 
				'translate(0 -' + 1.05*r + ')' + 
				'rotate(' + -curr_angle + ')'
			);
			curr_tick_group.appendChild(text1);
			
			if(is_quad) {
				curr_tick.setAttribute('class', 'major quad');
				
				text2 = document.createElementNS(NS_URI, 'text');
				text2.textContent = (i/mi) || 12;
				
				text2.setAttrs({
					'class': 'quad', 
					'transform': 
					'rotate(' + curr_angle + ')' + 
					'translate(0 -' + .8*r + ')' + 
					'rotate(' + -curr_angle + ')'
				});
				curr_tick_group.appendChild(text2);
			}
		}
		
		curr_tick_group.appendChild(curr_tick);
		frag.appendChild(curr_tick_group);
	}
	
	wrap.appendChild(frag);
	
	run();
};

var run = function() {
	var t = new Date(), 
			h = t.getHours(), curr_s_deg, curr_s_rad, 
			m = t.getMinutes(), curr_m_deg,
			s = t.getSeconds(), curr_h_deg, 
			ms = t.getMilliseconds(), curr_ms_deg, curr_ms_rad, 
			x, y, d_txt, j;
	
	j = (s >= .5*s_max)*1;
	d_txt = 'M0,' + -arc_r + 
			'A' + arc_r + ' ' + arc_r + ' 0 ' + j + ' 1 ';
	
	curr_s_rad = (s%s_max - (curr_s_deg > 10)*.5)*s_rad - .5*PI;
	curr_ms_rad = curr_s_rad + ms*ms_rad;
	curr_s_deg = (s%s_max)*s_deg;
	curr_ms_deg = curr_s_deg + ms*ms_deg;
	x = arc_r*cos(curr_ms_rad);
	y = arc_r*sin(curr_ms_rad);

	d_txt += x + ' ' + y;

	a_el.setAttribute('d', d_txt);
	
	if(curr_s_deg < 10) {
		if(v_el.style.display !== 'none'){
			v_el.style.display = 'none';
		}
	}
	else {
		if(v_el.style.display !== ''){
			v_el.style.display = '';
		}

		v_el.setAttribute(
			'transform', 
			'rotate(' + curr_ms_deg + ')'
		);
	}
		
	if(s != prev_s) {	
		curr_s_deg = (s%s_max)*s_deg;
		s_el.setAttribute(
			'transform', 
			'rotate(' + curr_s_deg + ')'
		);

		if(curr_s_deg < 10) {
			if(v_el.style.display !== 'none'){
				v_el.style.display = 'none';
			}
		}
		else {
			if(v_el.style.display !== ''){
				v_el.style.display = '';
			}

			v_el.setAttribute(
				'transform', 
				'rotate(' + curr_s_deg + ')'
			);
		}

		curr_m_deg = ((m%m_max) + s/s_max)*m_deg;
		m_el.setAttribute(
			'transform', 
			'rotate(' + curr_m_deg + ')'
		);

		curr_h_deg = ((h%h_max) + m/m_max)*h_deg;
		h_el.setAttribute(
			'transform', 
			'rotate(' + curr_h_deg + ')'
		);
	}
	
	prev_s = s;
	
	requestAnimationFrame(run);
};

var revert = function () {
	clockwise = !clockwise;
	p_el.setAttribute('class', (!clockwise)?'counterclockwise':'');
	p_el.setAttribute('transform', 'scale(' + (clockwise?1:-1) + ' 1)');
};

init();

svg.addEventListener('click', revert, false);