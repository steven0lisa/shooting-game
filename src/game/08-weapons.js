var Xv = {};
br(Xv, {
    create: () => dgn,
    showcase: () => PC
});
var im = (i, e, t) => {
        let n = Math.sin(i * 12.9898 + e * 78.233 + t * 37.719) * 43758.5453;
        return n - Math.floor(n)
    },
    cC = (i, e, t) => Math.max(Math.abs(i), Math.abs(e), Math.abs(t)) < .95,
    b_ = (i, e, t) => {
        let n = Math.abs(t);
        return n > .15 && n < .95
    };

function sm(i, e, t = 0, n = null) {
    let s = i.attributes.position,
        o = i.attributes.normal,
        r = s.count,
        a = new Float32Array(r * 3);
    for (let l = 0; l < r; l++) {
        let c = s.getX(l),
            u = s.getY(l),
            h = s.getZ(l),
            f = .9 + .2 * im(Math.round(c * 70), Math.round(u * 70), Math.round(h * 70));
        if (t > 0 && n && n(o.getX(l), o.getY(l), o.getZ(l))) {
            let p = im(Math.round(c * 300), Math.round(u * 300), Math.round(h * 300));
            {
                let d = Math.max(0, p - .84) / .16;
                f *= 1 + t * 1.6 * d * d
            }
        }
        a[l * 3] = e[0] * f, a[l * 3 + 1] = e[1] * f, a[l * 3 + 2] = e[2] * f
    }
    return i.setAttribute("color", new et(a, 3)), i
}
var y_ = new In,
    uC = new Ye;

function Rt(i, e, t, n, s, o, r, a, l = 0, c = null) {
    let u = Wi(i, e, t, n);
    return sm(u, a, l, cC), c && (y_.set(c[0], c[1], c[2]), u.applyMatrix4(uC.makeRotationFromEuler(y_))), u.translate(s, o, -r), u
}

function hC(i, e) {
    let t = new ji;
    if (i.forEach((n, s) => s ? t.lineTo(n[0], n[1]) : t.moveTo(n[0], n[1])), t.closePath(), e)
        for (let n of e) t.holes.push(new or(n.map(s => new Ae(s[0], s[1]))));
    return t
}

function __(i, e, t, n) {
    return new rr(hC(i, n), {
        depth: Math.max(1e-4, e - 2 * t),
        bevelEnabled: t > 0,
        bevelThickness: t,
        bevelSize: t,
        bevelOffset: -t,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 6
    })
}

function M_(i) {
    i.computeBoundingBox();
    let e = i.boundingBox.min.z,
        t = i.boundingBox.max.z,
        n = i.attributes.position,
        s = i.attributes.normal;
    for (let o = 0; o < n.count; o++) {
        let r = s.getZ(o),
            a = Math.abs(r);
        if (a < .15 || a > .95) continue;
        let l = n.getZ(o);
        if (Math.abs(l - e) < 1e-6 || Math.abs(l - t) < 1e-6) s.setXYZ(o, 0, 0, Math.sign(r));
        else {
            let c = Math.hypot(s.getX(o), s.getY(o)) || 1;
            s.setXYZ(o, s.getX(o) / c, s.getY(o) / c, 0)
        }
    }
    return i
}

function xr(i, e, t, n, s, o = 0, r = null) {
    let a = __(i, t - e, n, r);
    return sm(a, s, o, b_), M_(a), a.translate(0, 0, e + n), a.rotateY(Math.PI / 2), a
}

function qo(i, e, t, n, s, o = 0, r = null) {
    let a = __(i, t - e, n, r);
    return sm(a, s, o, b_), M_(a), a.translate(0, 0, -t + n), a
}

function Cn(i, e, t, n = 0, s = 0, o = 0, r = null) {
    let a = [],
        l = [],
        c = [],
        u = [],
        h = 0;
    for (let p = 0; p < i.length - 1; p++) {
        let [d, v] = i[p], [g, x] = i[p + 1], y = g - d, b = x - v, m = Math.hypot(y, b);
        if (m < 1e-7) continue;
        let A = b / m,
            _ = -y / m,
            M = Math.abs(A) > .25 && Math.abs(_) > .25;
        for (let E = 0; E <= e; E++) {
            let w = E / e * Math.PI * 2,
                S = Math.cos(w),
                z = Math.sin(w);
            for (let H = 0; H < 2; H++) {
                let O = H ? g : d,
                    q = H ? x : v,
                    U = s + O * S,
                    T = o + O * z,
                    D = -q;
                a.push(U, T, D), l.push(A * S, A * z, -_);
                let C = .9 + .2 * im(Math.round(q * 150), Math.round(w * 3), p);
                if (M && n > 0) {
                    let j = im(E * 7.1, p * 3.3, q * 100);
                    {
                        let N = Math.max(0, j - .84) / .16;
                        C *= 1 + n * 1.6 * N * N
                    }
                }
                let G = r ? r(O, q, t) : t;
                c.push(G[0] * C, G[1] * C, G[2] * C)
            }
        }
        for (let E = 0; E < e; E++) {
            let w = h + E * 2,
                S = w + 2,
                z = w + 1,
                H = w + 3;
            u.push(w, z, S, S, z, H)
        }
        h += (e + 1) * 2
    }
    let f = new nt;
    return f.setAttribute("position", new He(a, 3)), f.setAttribute("normal", new He(l, 3)), f.setAttribute("color", new He(c, 3)), f.setAttribute("uv", new He(new Float32Array(a.length / 3 * 2), 2)), f.setIndex(u), f
}

function Fi(i, e, t, n, s, o, r = 12, a = 0) {
    let l = Math.min(i * .25, e * .25),
        c = e / 2,
        u = Cn([
            [0, -c],
            [i - l, -c],
            [i, -c + l],
            [i, c - l],
            [i - l, c],
            [0, c]
        ], r, o, a);
    return u.rotateY(Math.PI / 2), u.translate(t, n, -s), u
}

function Dv(i, e, t, n, s = 4) {
    let o = [],
        r = n / 2,
        a = t / 2 - r;
    for (let l = 0; l <= s; l++) {
        let c = -Math.PI / 2 + l / s * Math.PI;
        o.push([i + a + Math.cos(c) * r, e + Math.sin(c) * r])
    }
    for (let l = 0; l <= s; l++) {
        let c = Math.PI / 2 + l / s * Math.PI;
        o.push([i - a + Math.cos(c) * r, e + Math.sin(c) * r])
    }
    return o
}
var fC = (i, e, t, n, s) => [
        [i + s, e],
        [t - s, e],
        [t, e + s],
        [t, n - s],
        [t - s, n],
        [i + s, n],
        [i, n - s],
        [i, e + s]
    ],
    mi = {
        name: "几猫九式突击步枪",
        muzzle: [0, 0, -.531],
        eject: [.023, .004, -.028],
        sightY: .069,
        lensF: .0285,
        window: [
            [-.016, .057],
            [.016, .057],
            [.016, .0772],
            [.0122, .081],
            [-.0122, .081],
            [-.016, .0772]
        ],
        magPos: [0, -.02, -.0665],
        boltTravel: .062,
        railTop: .0435,
        grip: [0, -.1, .073],
        handguard: [0, 0, -.255],
        handguardR: .021,
        handlePos: [-.026, .007, -.078],
        squeeze: .86
    };

function w_() {
    let i = [1, 1, 1],
        e = [1, 1, 1],
        t = [5.5, 5.5, 5.7],
        n = [.4, .4, .42],
        s = [1, 1, 1],
        o = [.022, .022, .023],
        r = [],
        a = [],
        l = [],
        c = [],
        u = [],
        h = [],
        f = [],
        p = 9,
        d = 5,
        v = .6,
        g = [
            [-.1, -.02],
            [.1, -.02],
            [.1, .027],
            [.093, .034],
            [-.088, .034],
            [-.1, .024]
        ];
    r.push(xr(g, 0, .0205, .0014, i, p, [fC(-.012, -.01, .06, .012, .003)])), r.push(xr(g, -.0205, 0, .0014, i, p, [Dv(.032, .007, .112, .0075, 4)])), a.push(Rt(.004, .036, .19, 5e-4, -.0135, .006, 0, n)), a.push(Rt(.004, .012, .19, 5e-4, .0145, .022, 0, n)), a.push(Rt(.004, .008, .19, 5e-4, .0145, -.014, 0, n)), a.push(Cn([
        [0, .058],
        [.0128, .058],
        [.0128, .099],
        [0, .099]
    ], 16, [.8, .8, .82])), r.push(Rt(.009, .02, .018, .003, .0225, .004, -.026, i, p, [0, -.35, 0])), r.push(Cn([
        [0, -.086],
        [.0062, -.086],
        [.0072, -.084],
        [.0072, -.06],
        [.0045, -.057],
        [0, -.057]
    ], 12, i, p, .0215, .012)), a.push(Cn([
        [0, -.094],
        [.0048, -.094],
        [.0055, -.092],
        [.0055, -.086],
        [0, -.086]
    ], 12, t, 0, .0215, .012)), r.push(Rt(.004, .012, .05, .0015, -.0212, -.006, -.055, i, p)), r.push(Rt(.004, .006, .15, .0015, -.0212, .0215, .012, i, p)), r.push(Rt(.003, .01, .03, .001, .0212, .022, .075, i, p)), r.push(qo([
        [-.0078, .0335],
        [.0078, .0335],
        [.0106, .0402],
        [-.0106, .0402]
    ], -.096, .397, 5e-4, i, 0));
    let x = [
        [-.0102, .0398],
        [.0102, .0398],
        [.0106, .0408],
        [.0084, .0435],
        [-.0084, .0435],
        [-.0106, .0408]
    ];
    for (let F = 0; F < 49; F++) {
        let X = -.094 + F * .01;
        r.push(qo(x, X, X + .0048, 8e-4, i, p))
    }
    let y = [
        [-.1, -.021],
        [.099, -.021],
        [.101, -.03],
        [.098, -.088],
        [.036, -.082],
        [.031, -.058],
        [-.03, -.058],
        [-.04, -.066],
        [-.078, -.055],
        [-.1, -.044]
    ];
    l.push(xr(y, -.019, .019, .0014, s, v)), l.push(Rt(.043, .01, .066, .002, 0, -.0835, .0668, s, v, [-.095, 0, 0])), l.push(Rt(.0405, .052, .005, 8e-4, 0, -.052, .0975, s, v)), l.push(Rt(.0405, .04, .005, 8e-4, 0, -.048, .0345, s, v)), a.push(Fi(.0038, .0396, 0, -.031, -.086, t, 12)), a.push(Fi(.0038, .0396, 0, -.029, .087, t, 12)), a.push(Fi(.0022, .0392, 0, -.04, -.012, t, 8)), a.push(Fi(.0022, .0392, 0, -.032, -.032, t, 8));
    for (let F of [-1, 1]) a.push(Fi(.0068, .004, F * .0205, -.036, -.048, e, 14, d)), a.push(Rt(.004, .006, .024, .0015, F * .0228, -.036, -.036, e, d, [.5, 0, 0]));
    a.push(Rt(.0045, .024, .013, .0015, -.0212, -.03, .022, e, d));
    for (let F = 0; F < 4; F++) a.push(Rt(.0012, .002, .012, 5e-4, -.0238, -.021 - F * .0045, .022, e, d));
    a.push(Fi(.0058, .005, .0205, -.042, .016, e, 12, d)), l.push(Rt(.004, .004, .026, 8e-4, .0205, -.051, .016, s, v)), l.push(Rt(.004, .02, .004, 8e-4, .0205, -.043, .027, s, v)), l.push(xr([
        [.033, -.056],
        [.033, -.093],
        [.024, -.1005],
        [-.031, -.1005],
        [-.041, -.09],
        [-.041, -.06]
    ], -.0085, .0085, 8e-4, s, v, [
        [
            [.028, -.059],
            [.028, -.091],
            [.022, -.096],
            [-.029, -.096],
            [-.036, -.088],
            [-.036, -.061]
        ]
    ])), a.push(xr([
        [-.006, -.057],
        [.004, -.057],
        [.003, -.069],
        [.0065, -.079],
        [.01, -.086],
        [.0065, -.088],
        [.001, -.081],
        [-.004, -.07]
    ], -.0032, .0032, 8e-4, t, 0)), l.push(xr([
        [-.038, -.05],
        [-.045, -.074],
        [-.049, -.086],
        [-.049, -.1],
        [-.054, -.112],
        [-.057, -.13],
        [-.064, -.158],
        [-.11, -.152],
        [-.102, -.112],
        [-.096, -.082],
        [-.095, -.064],
        [-.103, -.046],
        [-.08, -.044]
    ], -.0165, .0165, .005, s, v));
    for (let F = 0; F < 9; F++) {
        let X = -.078 - F * .0082,
            ne = -.073 + (X + .078) * .26;
        l.push(Rt(.0345, .0028, .03, .001, 0, X, ne, s, v, [-.25, 0, 0]))
    }
    for (let F = 0; F < 7; F++) {
        let X = -.078 - F * .01,
            ne = -.098 + (X + .078) * .14;
        l.push(Rt(.022, .0045, .006, .0015, 0, X, ne, s, v, [-.14, 0, 0]))
    }
    l.push(Rt(.035, .006, .05, .002, 0, -.157, -.087, s, v, [.13, 0, 0])), a.push(Fi(.003, .034, 0, -.15, -.085, t, 8));
    let b = mi.handguardR,
        m = .00885,
        A = .0028,
        _ = .101,
        M = .398,
        E = [
            [_, -m],
            [M, -m],
            [M, m],
            [_, m]
        ];
    for (let F = 0; F < 8; F++) {
        let X = [];
        if (F === 0 || F === 4 || F === 6)
            for (let $ = 0; $ < 6; $++) X.push(Dv(.13 + $ * .047, 0, .032, .007, 4));
        else if (F !== 2)
            for (let $ = 0; $ < 10; $++) {
                let ue = .124 + $ * .027;
                F === 3 && ue > .3 || X.push(Dv(ue, 0, .013, .0052, 3))
            }
        let ne = xr(E, b - A, b, 9e-4, i, p, X);
        ne.rotateZ(F * Math.PI / 4), r.push(ne);
        let re = (F + .5) * Math.PI / 4;
        r.push(Cn([
            [0, _],
            [.003, _],
            [.003, M],
            [0, M]
        ], 8, i, 0, Math.cos(re) * .0197, Math.sin(re) * .0197))
    }
    r.push(qo([
        [-.0088, .02],
        [.0088, .02],
        [.0106, .029],
        [.0082, .0338],
        [-.0082, .0338],
        [-.0106, .029]
    ], .1012, .3978, .0012, i, p)), r.push(Cn([
        [.016, .096],
        [.0238, .096],
        [.0243, .0966],
        [.0243, .106],
        [.0232, .1075],
        [.016, .1075]
    ], 24, i, p)), r.push(Cn([
        [.018, .3985],
        [.0224, .3985],
        [.0224, .4003],
        [.0218, .401],
        [.018, .401],
        [.018, .3985]
    ], 8, i, p));
    for (let F of [-1, 1])
        for (let X of [.112, .126]) a.push(Fi(.0024, .0024, F * .0212, -.004, X, t, 10));
    for (let F of [.115, .215, .3, .385])
        for (let X of [-1, 1]) a.push(Cn([
            [0, -8e-4],
            [.0017, -8e-4],
            [.002, -4e-4],
            [.002, 6e-4],
            [0, 6e-4]
        ], 8, t, 0, 0, 0).rotateX(Math.PI / 2).translate(X * .0098, .0312, -F));
    {
        let X = [qo([
            [-.0078, .0206],
            [.0078, .0206],
            [.0106, .0242],
            [-.0106, .0242]
        ], .318, .396, 5e-4, i, 0)];
        for (let ne = 0; ne < 8; ne++) {
            let re = .319 + ne * .01;
            X.push(qo(x.map($ => [$[0], $[1] - .016]), re, re + .0048, 5e-4, i, p))
        }
        for (let ne of X) ne.rotateZ(Math.PI / 4), r.push(ne)
    } {
        let F = [];
        for (let X = 0; X < 4; X++) {
            let ne = .352 + X * .01;
            F.push(qo(x.map(re => [re[0], re[1] - .016]), ne, ne + .0048, 5e-4, i, p))
        }
        F.push(qo([
            [-.0078, .0206],
            [.0078, .0206],
            [.0106, .0242],
            [-.0106, .0242]
        ], .35, .392, 5e-4, i, 0));
        for (let X of F) X.rotateZ(Math.PI), r.push(X)
    }
    l.push(xr([
        [.35, -.026],
        [.392, -.026],
        [.388, -.036],
        [.372, -.05],
        [.362, -.05],
        [.354, -.036]
    ], -.011, .011, .003, s, v)), l.push(xr([
        [.2395, -.0215],
        [.2725, -.0215],
        [.2725, -.03],
        [.27, -.092],
        [.2665, -.0965],
        [.2455, -.0975],
        [.242, -.093],
        [.2395, -.03]
    ], -.014, .014, .0045, s, v));
    for (let F = 0; F < 6; F++) l.push(Rt(.0292, .0022, .0315, 8e-4, 0, -.04 - F * .0085, .256 - F * 3e-4, s, v));
    l.push(Rt(.03, .005, .04, .0015, 0, -.024, .256, s, v)), a.push(Fi(.003, .031, 0, -.025, .256, t, 10)), a.push(Cn([
        [.0115, .095],
        [.0115, .15],
        [.0095, .153],
        [.0095, .285],
        [.009, .288],
        [.009, .322],
        [.0086, .326],
        [.0086, .435],
        [.0092, .437],
        [.0092, .453],
        [.0075, .455],
        [.0075, .461]
    ], 20, e, d)), a.push(Cn([
        [.0092, .286],
        [.0135, .286],
        [.0142, .2875],
        [.0142, .3165],
        [.0135, .318],
        [.0092, .318]
    ], 16, e, d)), a.push(Rt(.014, .009, .03, .002, 0, .0145, .302, e, d)), a.push(Cn([
        [0, .1],
        [.0026, .1],
        [.0026, .3],
        [0, .3]
    ], 8, t, 0, 0, .0172)), a.push(Fi(.002, .0145, 0, .012, .308, t, 6)), a.push(Cn([
        [.0075, .459],
        [.0108, .459],
        [.0116, .4605],
        [.0116, .477],
        [.011, .478],
        [.0052, .478]
    ], 20, e, d)), a.push(Cn([
        [.0052, .477],
        [.0052, .517]
    ], 12, n));
    for (let F of [.4865, .4965, .5065]) a.push(Cn([
        [.0052, F - .0019],
        [.011, F - .0019],
        [.0116, F - .0012],
        [.0116, F + .0012],
        [.011, F + .0019],
        [.0052, F + .0019]
    ], 20, e, d));
    a.push(Cn([
        [.0052, .5145],
        [.011, .5145],
        [.0116, .5155],
        [.0116, .527],
        [.0102, .5305],
        [.0048, .5305],
        [.0036, .526],
        [.0036, .495]
    ], 20, e, d, 0, 0, (F, X, ne) => F < .0047 ? [.25, .25, .25] : ne));
    for (let F of [-1, 1]) a.push(Rt(.0125, .0042, .042, .0012, 0, F * .0096, .496, e, d));
    for (let F = 0; F < 3; F++) a.push(Fi(.0016, .0236, 0, 0, .4675 + F * .0035, n, 6));
    r.push(Cn([
        [0, -.292],
        [.0142, -.292],
        [.0148, -.2905],
        [.0148, -.1]
    ], 20, i, p)), r.push(Cn([
        [.0148, -.122],
        [.0185, -.122],
        [.0195, -.1205],
        [.0195, -.1115],
        [.0185, -.11],
        [.0148, -.11]
    ], 12, i, p * 1.5));
    {
        let F = [
                [-.019, -.024],
                [.019, -.024],
                [.021, -.018],
                [.021, .018],
                [.016, .024],
                [-.016, .024],
                [-.021, .018],
                [-.021, .006],
                [-.036, .004],
                [-.04, -.002],
                [-.04, -.014],
                [-.034, -.02],
                [-.021, -.02]
            ],
            X = [
                [-.025, -.014],
                [-.025, -.002],
                [-.033, -5e-4],
                [-.036, -.004],
                [-.036, -.012],
                [-.032, -.016]
            ];
        a.push(qo(F, -.1095, -.1045, 8e-4, [1.6, 1.6, 1.65], d, [X]))
    }
    l.push(xr([
        [-.146, .024],
        [-.3, .024],
        [-.331, .014],
        [-.334, -.086],
        [-.318, -.101],
        [-.29, -.096],
        [-.232, -.04],
        [-.146, -.024]
    ], -.019, .019, .004, s, v, [
        [
            [-.262, -.036],
            [-.306, -.036],
            [-.306, -.074],
            [-.292, -.074]
        ]
    ])), l.push(Rt(.033, .016, .118, .006, 0, .031, -.232, s, v));
    for (let F of [-.196, -.268]) a.push(Fi(.0032, .035, 0, .03, F, t, 8));
    l.push(Rt(.012, .012, .04, .003, 0, -.033, -.19, s, v, [.2, 0, 0])), f.push(Rt(.037, .12, .011, .004, 0, -.04, -.3395, o, 0));
    for (let F = 0; F < 9; F++) f.push(Rt(.031, .004, .003, .001, 0, .004 - F * .011, -.3455, o, 0));
    for (let F of [-1, 1]) a.push(Fi(.0065, .003, F * .0195, -.06, -.318, t, 12));
    let w = mi.sightY,
        S = mi.window,
        z = [.012, .012, .013];
    r.push(Rt(.03, .0092, .04, .0016, 0, .048, .021, i, p)), r.push(Rt(.0045, .0085, .034, .001, -.0162, .0452, .021, i, p));
    for (let F of [.009, .033]) a.push(Fi(.004, .0042, -.02, .0452, F, t, 6)), a.push(Fi(.003, .0022, .016, .0452, F, t, 10));
    let H = [
        [-.0192, .0525],
        [.0192, .0525],
        [.0192, .0788],
        [.0138, .0842],
        [-.0138, .0842],
        [-.0192, .0788]
    ];
    r.push(qo(H, .008, .034, .001, i, p, [S])), f.push(qo(S.map(F => [F[0] * 1.004, (F[1] - w) * 1.004 + w]), .0078, .0342, 0, z, 0, [S.map(F => [F[0] * .982, (F[1] - w) * .982 + w])]));
    let O = [
        [-.0204, .06],
        [-.0204, .0792],
        [-.0143, .0854],
        [.0143, .0854],
        [.0204, .0792],
        [.0204, .06],
        [.0193, .06],
        [.0193, .0788],
        [.0138, .0843],
        [-.0138, .0843],
        [-.0193, .0788],
        [-.0193, .06]
    ];
    r.push(qo(O, .029, .038, 3e-4, i, p)), a.push(Cn([
        [0, -.006],
        [.0052, -.006],
        [.0058, -.0054],
        [.0058, .0036],
        [.0052, .0042],
        [0, .0042]
    ], 14, e, d, 0, 0).rotateY(Math.PI / 2).translate(.0222, .0625, -.021));
    for (let F of [.0165, .0245]) f.push(Rt(.0022, .0055, .0055, 9e-4, -.0196, .064, F, o, 0));
    for (let F of [.012, .03])
        for (let X of [-1, 1]) a.push(Fi(.0016, .0012, X * .0195, .0555, F, t, 8));
    f.push(Rt(.009, .0026, .006, 6e-4, 0, .058, .0115, z));
    for (let [F, X] of [
            [.0128, .0548],
            [-.0128, .0548]
        ]) a.push(Cn([
        [0, -6e-4],
        [.0019, -6e-4],
        [.0022, -2e-4],
        [.0022, 7e-4],
        [0, 7e-4]
    ], 10, t, 0, F, X).translate(0, 0, -.008 + 1e-4).rotateY(0));
    a.push(Cn([
        [0, -.001],
        [.0026, -.001],
        [.003, -5e-4],
        [.003, .0012],
        [0, .0012]
    ], 12, t, 0, 0, 0).rotateX(Math.PI / 2).translate(.009, .0842, -.014)), f.push(Rt(.0012, 2e-4, .0044, 5e-5, .009, .0855, .014, z)), f.push(qo(S, .0304, .0318, 0, z, 0, [S.map(F => [F[0] * .955, (F[1] - w) * .955 + w])]));
    for (let [F, X] of [
            [-.03, 1],
            [.372, -1]
        ]) a.push(Rt(.021, .0075, .03, .0015, 0, .0472, F, e, d)), a.push(Rt(.0125, .004, .036, .001, 0, .0527, F + X * .004, e, d)), a.push(Fi(.0028, .024, 0, .0505, F - X * .013, e, 8)), a.push(Rt(.004, .006, .006, .001, X * .0125, .0475, F, e, d)), a.push(Fi(.0042, .0045, -.0125, .0475, F + .006, t, 8));
    a.push(Cn([
        [.0016, -.0012],
        [.0034, -.0012],
        [.0038, -8e-4],
        [.0038, 8e-4],
        [.0034, .0012],
        [.0016, .0012],
        [.0016, -.0012]
    ], 12, e, d, 0, 0).rotateX(Math.PI / 2).translate(0, .0553, .016)), a.push(Fi(.0048, .005, .015, .049, -.036, e, 12, d));
    for (let F = 0; F < 6; F++) a.push(Rt(.0044, .001, .001, 3e-4, .015, .049 + Math.sin(F * 1.047) * .0046, -.036 + Math.cos(F * 1.047) * .0046, e, d));
    r.push(Rt(.016, .005, .02, .0012, 0, .0355, -.098, i, p)), a.push(Rt(.01, .003, .008, 8e-4, 0, .0392, -.0985, e, d));
    for (let F = 0; F < 4; F++) a.push(Rt(.0092, 8e-4, .001, 3e-4, 0, .0409, -.0958 - F * .0018, e, d));
    let q = -.0267,
        U = .0267;
    a.push(Cn([
        [0, .308],
        [.0095, .308],
        [.0108, .3095],
        [.0108, .322],
        [.0118, .323],
        [.0118, .378],
        [.0128, .38],
        [.0142, .382],
        [.0142, .404],
        [.0136, .406],
        [.0142, .408],
        [.0142, .412],
        [.0128, .4135],
        [.0118, .4135],
        [.0112, .409]
    ], 18, e, d, q, U)), a.push(Cn([
        [.0112, .409],
        [0, .409]
    ], 18, [.35, .4, .45], 0, q, U));
    for (let F = 0; F < 5; F++) a.push(Cn([
        [.0118, .33 + F * .008],
        [.0124, .3305 + F * .008],
        [.0124, .3335 + F * .008],
        [.0118, .334 + F * .008]
    ], 18, e, d, q, U));
    {
        let F = Rt(.02, .008, .04, .0012, 0, .028, .352, e, d);
        F.rotateZ(Math.PI / 4), a.push(F)
    } {
        let F = Fi(.004, .006, .0135, .028, .352, t, 8);
        F.rotateZ(Math.PI / 4), a.push(F)
    }
    f.push(Rt(.0185, .0065, .07, .0025, 0, .0468, .214, o, 0));
    for (let F = 0; F < 6; F++) f.push(Rt(.014, .0012, .004, 5e-4, 0, .0503, .192 + F * .009, o, 0));
    let T = Fn([
        [q, U, -.308],
        [q - .001, U + .002, -.296],
        [-.0265, .0235, -.284],
        [-.0255, .0215, -.272],
        [-.0235, .027, -.262],
        [-.016, .04, -.256],
        [-.007, .0465, -.252],
        [-.002, .047, -.247]
    ], .0018, 6);
    sm(T, o, 0), f.push(T);
    for (let F of [
            [-.0262, .0228, .28],
            [-.0242, .0255, .265]
        ]) {
        let X = Rt(.0065, .0026, .0035, 8e-4, 0, 0, 0, [.03, .03, .03], 0);
        X.rotateZ(Math.PI / 4), X.translate(F[0], F[1], -F[2]), f.push(X)
    }
    c.push(Cn([
        [0, -.058],
        [.0118, -.058],
        [.0124, -.057],
        [.0124, -.01],
        [.0116, -.008],
        [.0116, -.002],
        [.0124, 0],
        [.0124, .046],
        [.0105, .048],
        [.0105, .056],
        [.0062, .056],
        [.0062, .06],
        [0, .06]
    ], 16, [7, 7, 7.2], 0, 0, .001));
    for (let F = 0; F < 5; F++) c.push(Rt(.0015, .008, .003, 5e-4, .0122, .001, .01 + F * .007, [1.2, 1.2, 1.2], 0));
    c.push(Rt(.012, .0055, .014, .0015, -.0165, .007, .078, e, d));
    {
        let F = Cn([
            [0, -.009],
            [.0045, -.009],
            [.0056, -.0078],
            [.0056, -.003],
            [.0048, -.002],
            [.0048, .002],
            [.0056, .003],
            [.0056, .0078],
            [.0045, .009],
            [0, .009]
        ], 12, e, d);
        F.rotateY(Math.PI / 2), F.translate(-.031, .007, -.078), c.push(F)
    }
    let D = F => 1.5 * Math.pow(Math.max(0, F - .07), 2),
        C = F => 3 * Math.max(0, F - .07),
        G = [1, 1, 1],
        j = [],
        N = .212,
        Q = 12;
    for (let F = 0; F <= Q; F++) {
        let X = -.004 + (N + .004) * F / Q;
        j.push([D(X) + .0298, -X])
    }
    for (let F = Q; F >= 0; F--) {
        let X = -.004 + (N + .004) * F / Q;
        j.push([D(X) - .0298, -X])
    }
    u.push(xr(j, -.0113, .0113, .002, G, .25));
    for (let F = 0; F < 8; F++) {
        let X = .082 + F * .0155;
        u.push(Rt(.0246, .0058, .05, .0016, 0, -X, D(X), G, .3, [Math.atan(C(X)), 0, 0]))
    }
    for (let F = 0; F < 10; F++) {
        let X = .078 + F * .013;
        u.push(Rt(.012, .011, .004, .001, 0, -X, D(X) + .0302, G, .3, [Math.atan(C(X)), 0, 0]))
    }
    u.push(Rt(.027, .009, .068, .003, 0, -N - .003, D(N) + .001, G, .3, [Math.atan(C(N)), 0, 0])), u.push(Rt(.01, .004, .012, .001, 0, -N - .008, D(N) - .01, [.6, .6, .6], 0, [Math.atan(C(N)), 0, 0])), u.push(Rt(.003, .006, .04, .001, -.0085, .0045, .004, G, .3)), u.push(Rt(.003, .006, .04, .001, .0085, .0045, .004, G, .3));
    let K = [1.25, .72, .5];
    h.push(Cn([
        [0, -.02],
        [.004, -.02],
        [.0047, -.019],
        [.0047, .01],
        [.0034, .014],
        [.0034, .018]
    ], 12, [1, 1, 1], 0, .002, .0062)), h.push(Cn([
        [.003, .018],
        [.0029, .024],
        [.0022, .03],
        [.001, .0345],
        [0, .0352]
    ], 12, K, 0, .002, .0062)), h.push(Cn([
        [0, -.02],
        [.004, -.02],
        [.0047, -.019],
        [.0047, .01]
    ], 10, [.8, .8, .8], 0, -.003, 5e-4));
    let ie = {
        ano: Ii(r),
        gun: Ii(a),
        poly: Ii(l),
        plain: Ii(f),
        bolt: Ii(c),
        mag: Ii(u),
        round: Ii(h)
    };
    for (let F of ["ano", "gun", "poly", "plain", "bolt"]) {
        let X = ie[F].attributes.position;
        for (let ne = 0; ne < X.count; ne++) X.getZ(ne) > -.1002 && X.getY(ne) < .0341 && X.setX(ne, X.getX(ne) * mi.squeeze)
    }
    for (let F in ie) ie[F].computeBoundingSphere();
    return ie
}
var Kc = i => (i.index ? i.index.count : i.attributes.position.count) / 3;
var ti = W,
    vl = Lt,
    rm = Ye,
    Bv = [31, 21.5, 12.5],
    Fv = [5.6, 5.3, 5],
    Lv = [3.2, 3.1, 3],
    am = [12.5, 10, 7.6],
    lm = [16, 11, 6.6],
    dC = [3, 2.6, 2.2],
    kf = [36, 27, 16],
    gl = [20, 14, 8.4],
    Df = [4.8, 4.5, 4.2],
    pC = [30, 9.5, 2.2],
    E_ = [5, 6.9, 9],
    mC = [30, 9.5, 2.2],
    gC = [26, 26, 25],
    um = i => i < 0 ? 0 : i > 1 ? 1 : i,
    xl = (i, e, t) => (t = um((t - i) / (e - i)), t * t * (3 - 2 * t)),
    Ff = (i, e) => Math.sign(i) * Math.pow(Math.abs(i), e),
    vC = i => {
        let e = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        return e - Math.floor(e)
    },
    Xo = new ti,
    S_ = new ti(0, 0, -1),
    yl = class {
        constructor(e) {
            this.N = e, this.P = [], this.C = [], this.weld = []
        }
        v(e, t, n = 1) {
            this.P.push(e.x, e.y, e.z), this.C.push(t[0] * n, t[1] * n, t[2] * n)
        }
        rings() {
            return this.P.length / 3 / this.N
        }
        collapse() {
            this.weld.push(this.rings() - 1)
        }
        geo(e = !1) {
            let t = this.N,
                n = this.rings(),
                s = [];
            for (let a = 0; a < n - 1; a++)
                for (let l = 0; l < t; l++) {
                    let c = a * t + l,
                        u = a * t + (l + 1) % t,
                        h = c + t,
                        f = u + t;
                    e ? s.push(c, u, h, u, f, h) : s.push(c, h, u, u, h, f)
                }
            let o = new nt;
            o.setAttribute("position", new He(this.P, 3)), o.setAttribute("color", new He(this.C, 3)), o.setAttribute("uv", new He(new Float32Array(this.P.length / 3 * 2), 2)), o.setIndex(s), o.computeVertexNormals();
            let r = o.attributes.normal;
            for (let a of this.weld) {
                let l = 0,
                    c = 0,
                    u = 0;
                for (let f = 0; f < t; f++) l += r.getX(a * t + f), c += r.getY(a * t + f), u += r.getZ(a * t + f);
                let h = Math.hypot(l, c, u) || 1;
                for (let f = 0; f < t; f++) r.setXYZ(a * t + f, l / h, c / h, u / h)
            }
            return o
        }
    };

function I_(i, e, t) {
    let n = [],
        s = [],
        o = [],
        r = i.length,
        a = e.length;
    for (let c = 0; c < a; c++)
        for (let u = 0; u < r; u++) {
            let h = t(i[u], e[c], Xo);
            n.push(Xo.x, Xo.y, Xo.z), s.push(h[0], h[1], h[2])
        }
    for (let c = 0; c < a - 1; c++)
        for (let u = 0; u < r - 1; u++) {
            let h = c * r + u,
                f = h + 1,
                p = h + r,
                d = p + 1;
            o.push(h, f, p, f, d, p)
        }
    let l = new nt;
    return l.setAttribute("position", new He(n, 3)), l.setAttribute("color", new He(s, 3)), l.setAttribute("uv", new He(new Float32Array(n.length / 3 * 2), 2)), l.setIndex(o), l.computeVertexNormals(), l
}
var Uv = [-1, -.9, -.5, 0, .5, .9, 1],
    cm = i => Math.abs(i) > .95 ? -1 : Math.abs(i) > .8 ? .82 : 1;

function Lf(i, e, t, n, s, o, r, a = null, l = !1, c = Uv, u = Uv) {
    return I_(c, u, (h, f, p) => {
        let d = i + h * t,
            v = e + (l ? f : -f) * n,
            g = Math.min(cm(h), cm(f)),
            x = r(d, v) + (g < 0 ? -.0022 : s * g);
        p.set(d, l ? -x : x, v), a && a(p);
        let y = typeof o == "function" ? o(h, f) : o,
            b = g < 0 ? .5 : g < 1 ? .8 : 1;
        return [y[0] * b, y[1] * b, y[2] * b]
    })
}
var om = [{
        base: [-.031, 0, -.094],
        len: [.044, .026, .022],
        rad: [.0096, .009, .0083, .0076]
    }, {
        base: [-.0105, .001, -.099],
        len: [.049, .03, .023],
        rad: [.0097, .0091, .0084, .0077]
    }, {
        base: [.0105, 0, -.095],
        len: [.045, .028, .022],
        rad: [.0094, .0088, .0081, .0074]
    }, {
        base: [.03, -.002, -.086],
        len: [.035, .021, .02],
        rad: [.0084, .0078, .0072, .0066]
    }],
    Nv = [12, 34, 44, 68, 90, 112, 136, 146, 168, 192, 220, 245, 270, 295, 320, 348].map(i => i * Math.PI / 180),
    T_ = Nv.length,
    A_ = .0012,
    R_ = [.14, .22, .27, .73, .78, .88],
    xC = [.1, .17, .1];

function z_(i) {
    let e = new yl(T_),
        {
            base: t,
            qs: n,
            len: s,
            rad: o
        } = i,
        r = i.pads || [1, 1, 0],
        a = i.patchJ ?? 1,
        l = i.bump || xC,
        c = i.tipW || 1,
        u = i.tipH || 1,
        h = [],
        f = [],
        p = t.clone();
    for (let M = 0; M < 3; M++) h.push(p.clone()), f.push(S_.clone().applyQuaternion(n[M + 1])), p.addScaledVector(f[M], s[M]);
    let d = S_.clone().applyQuaternion(n[0]),
        v = M => M ? f[M - 1] : d,
        g = [0, 1, 2].map(M => new ti().addVectors(v(M), f[M]).normalize()),
        x = (M, E) => (M.x - h[E].x) * g[E].x + (M.y - h[E].y) * g[E].y + (M.z - h[E].z) * g[E].z,
        y = (M, E) => {
            let w = x(M, E);
            w > 0 && M.addScaledVector(v(E), -w / v(E).dot(g[E]))
        },
        b = (M, E) => {
            let w = x(M, E);
            w < 0 && M.addScaledVector(f[E], -w / f[E].dot(g[E]))
        },
        m = new ti,
        A = new vl,
        _ = (M, E, w, S) => {
            let z = S.kD || 1,
                H = S.kP || 1,
                O = S.ao || 1;
            for (let q = 0; q < T_; q++) {
                let U = Math.cos(Nv[q]),
                    T = Math.sin(Nv[q]),
                    D = q >= 1 && q <= 7,
                    C = q >= 2 && q <= 6,
                    G = w * U,
                    j = T > 0 ? w * .96 * T * (C ? z : 1 + (z - 1) * .4) : w * .98 * T * H;
                S.pad && C && (G += U * A_, j += T * A_), G *= S.wx || 1, j *= S.wy || 1, m.set(G, j, 0).applyQuaternion(M).add(E), S.a >= 0 && y(m, S.a), S.b >= 0 && b(m, S.b);
                let N = D ? Bv : q >= 10 && q <= 14 ? am : lm,
                    Q = O;
                S.pad && C ? N = Fv : S.patch && C && (N = lm, Q *= .9), (S.pad && D && !C || S.edge && D) && (N = dC), S.saddle && q >= 8 && (N = am, Q *= .9), S.stitch && D && (N = kf, Q *= .8), (q === 0 || q === 8 || q === 9 || q === 15) && (Q *= .72), q >= 9 && (Q *= S.aoP || 1), e.v(m, N, Q)
            }
        };
    _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || .012) - .002), 1e-5, {
        a: 0,
        b: -1,
        ao: i.rootAo || .5
    }), e.collapse(), _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || .012)), o[0] * (i.rootK || 1), {
        a: 0,
        b: -1,
        ao: i.rootAo || .5,
        saddle: i.saddle
    });
    for (let M = 0; M < 3; M++) {
        for (let E = 0; E < 4; E++) {
            let w = E / 3;
            A.slerpQuaternions(n[M], n[M + 1], w), _(A, Xo.copy(h[M]).addScaledVector(E < 2 ? v(M) : f[M], (E - 1.5) * 4e-4), o[M], {
                a: w < .5 ? M : -1,
                b: w < .5 ? -1 : M,
                kD: 1 + l[M] * (E === 0 || E === 3 ? .55 : 1),
                patch: M === a,
                saddle: i.saddle && M < 2,
                wx: M === 2 ? 1 + (c - 1) * .5 : 1,
                wy: M === 2 ? 1 + (u - 1) * .5 : 1,
                ao: M === 0 && !i.rootAo ? .62 + .1 * E : 1,
                aoP: E === 1 || E === 2 ? .55 : .8
            })
        }
        if (M < 2)
            for (let E = 0; E < R_.length; E++) {
                let w = R_[E],
                    S = (o[M] + (o[M + 1] - o[M]) * w) * (1 - .06 * Math.sin(Math.PI * w));
                _(n[M + 1], Xo.copy(h[M]).addScaledVector(f[M], s[M] * w), S, {
                    a: M + 1,
                    b: M,
                    pad: r[M] && (E === 2 || E === 3),
                    edge: r[M] && (E === 1 || E === 4),
                    saddle: i.saddle && M === 0,
                    ao: M === 0 && !i.rootAo ? .86 + .14 * xl(0, .5, w) : 1
                })
            } else {
                let E = o[3],
                    w = s[2] - E;
                _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * .2), o[2] * .97, {
                    a: -1,
                    b: 2,
                    stitch: 1,
                    wx: c,
                    wy: u
                }), _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * .42), (o[2] + E) * .5, {
                    a: -1,
                    b: 2,
                    kP: 1.08,
                    wx: c,
                    wy: u
                });
                for (let S of [0, .6, 1.05, 1.36]) _(n[3], Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08 * Math.sin(S)), E * Math.cos(S), {
                    a: -1,
                    b: -1,
                    kP: 1.06,
                    wx: c,
                    wy: u
                });
                _(n[3], Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08), 1e-5, {
                    a: -1,
                    b: -1
                }), e.collapse()
            }
    }
    return e.geo()
}
var yC = i => new vl().setFromAxisAngle(new ti(0, 1, 0), i),
    bC = i => new vl().setFromAxisAngle(new ti(1, 0, 0), i);

function C_(i, e) {
    let t = [yC(e[3] || 0)];
    for (let n = 0; n < 3; n++) t.push(t[n].clone().multiply(bC(-e[n])));
    return z_({
        base: new ti(i.base[0], i.base[1], i.base[2]),
        qs: t,
        len: i.len,
        rad: i.rad
    })
}

function _C(i, e) {
    let t = i.clone().negate(),
        n = new ti().crossVectors(e, t);
    n.lengthSq() < 1e-6 && n.set(1, 0, 0), n.normalize();
    let s = new ti().crossVectors(t, n);
    return new vl().setFromRotationMatrix(new rm().makeBasis(n, s, t))
}

function MC(i) {
    let e = i.map(o => new ti(o[0], o[1], o[2]).normalize()),
        t = new ti(-.72, .69, 0),
        n = [],
        s = e[2].clone().sub(e[0]);
    s.length() > .12 && t.multiplyScalar(.25).addScaledVector(s.normalize(), -1);
    for (let o = 0; o < 3; o++) n.push(_C(e[o], t));
    return n.unshift(n[0].clone()), z_({
        base: new ti(-.028, -.007, -.014),
        qs: n,
        len: [.044, .031, .026],
        rad: [.0165, .0118, .011, .01],
        pads: [0, 1, 0],
        patchJ: 2,
        bump: [0, .2, .2],
        tipW: 1.12,
        tipH: .86,
        saddle: 1,
        rootBack: .01,
        rootK: .72,
        rootAo: .9
    })
}
var Qc = .006,
    D_ = i => -.0975 + .0125 * Math.pow((i + .008) / .04, 2),
    Ov = i => D_(i) + .006,
    Hv = i => .029 + .014 * xl(.05, .85, i),
    L_ = i => .0185 - .0065 * xl(.1, 1, i),
    k_ = i => .0185 + .003 * Math.sin(Math.PI * um(i * 1.6)) - .0055 * xl(.3, 1, i);

function kv(i, e) {
    let t = um((Qc - e) / (Qc - Ov(i))),
        n = Math.min(.999, Math.abs(i / Hv(t)));
    return L_(t) * Math.pow(1 - Math.pow(n, 2.5), .4)
}

function wC(i, e) {
    let t = um((Qc - e) / (Qc - Ov(i))),
        n = Hv(t),
        s = Math.min(.999, Math.abs(i / n));
    return k_(t) * Math.pow(1 - Math.pow(s, 2.5), .4) * (1 + .14 * Math.max(0, i / n) * Math.sin(Math.PI * t))
}

function EC() {
    let e = new yl(24),
        t = new ti,
        n = [
            [0, 0, 1, 1],
            [.1, 0, 1, 1],
            [.22, 0, 1, 1],
            [.36, 0, 1, 1],
            [.5, 0, 1, 1],
            [.64, 0, 1, 1],
            [.77, 0, 1, 1],
            [.89, 0, 1, 1],
            [1, 0, 1, 1],
            [1, -.005, .8, 1],
            [1, -.009, .45, .985],
            [1, -.0105, .04, .97]
        ];
    for (let [s, o, r, a] of n) {
        let l = Hv(s) * a,
            c = L_(s) * r,
            u = k_(s) * r;
        for (let h = 0; h < 24; h++) {
            let f = (h + .5) / 24 * Math.PI * 2,
                p = Math.cos(f),
                d = Math.sin(f),
                v = l * Ff(p, .8),
                g = d >= 0 ? c * Ff(d, .8) : u * Ff(d, .8) * (1 + .14 * Math.max(0, v / l) * Math.sin(Math.PI * s));
            t.set(v, g, Qc + (Ov(v) - Qc) * s + o);
            let x = d > .3 ? Bv : d < -.3 ? am : lm,
                y = 1;
            s === .1 && d > .3 && (x = kf, y = .75), o < 0 && (x = lm, y = .7 + o * 30), d < -.3 && (y *= .82 + .18 * Math.abs(p)), e.v(t, x, y)
        }
    }
    return e.geo()
}

function SC(i) {
    let t = new yl(12),
        n = new ti,
        s = new ti,
        o = new ti,
        r = new ti,
        a = new ti,
        l = new ti(i.x, i.y, i.z - 1).normalize(),
        c = [-.12, 0, .2, .4, .6, .78, .9];
    for (let d = 0; d < c.length; d++) {
        let v = c[d],
            g = d === 0 || d === c.length - 1;
        s.set(-.028, -.007, -.014).addScaledVector(i, .044 * v), o.set(-.03, -.003, -.022 - .06 * v), r.subVectors(s, o);
        let x = r.length() * .5 + .005;
        r.normalize(), a.crossVectors(r, l).normalize();
        let y = g ? 1e-5 : .0085 * (1 - .55 * v),
            b = g ? 1e-5 : x * (1 - .3 * v * v);
        for (let m = 0; m < 12; m++) {
            let A = (m + .5) / 12 * Math.PI * 2,
                _ = Math.cos(A),
                M = Math.sin(A);
            n.copy(s).add(o).multiplyScalar(.5).addScaledVector(r, _ * b).addScaledVector(a, M * y);
            let E = a.y * M < 0;
            t.v(n, E ? am : Bv, E ? .85 : .92)
        }
        g && t.collapse()
    }
    let u = t.geo(),
        h = u.attributes.position,
        f = u.index.array,
        p = 0;
    for (let d = 0; d < f.length; d += 3) s.fromBufferAttribute(h, f[d]), o.fromBufferAttribute(h, f[d + 1]), n.fromBufferAttribute(h, f[d + 2]), p += s.dot(o.cross(n));
    if (p < 0) {
        for (let d = 0; d < f.length; d += 3) {
            let v = f[d + 1];
            f[d + 1] = f[d + 2], f[d + 2] = v
        }
        u.computeVertexNormals()
    }
    return u
}

function P_(i) {
    if (i.scale(-1, 1, 1), !i.index) {
        let t = i.attributes.position.count,
            n = new Uint32Array(t);
        for (let s = 0; s < t; s++) n[s] = s;
        i.setIndex(new et(n, 1))
    }
    let e = i.index.array;
    for (let t = 0; t < e.length; t += 3) {
        let n = e[t + 1];
        e[t + 1] = e[t + 2], e[t + 2] = n
    }
    return i
}

function Vv(i) {
    let e = [],
        t = i.debugParts || null,
        n = (d, v) => (e.push(v), t && t.push([d, v]), v);
    n("palm", EC());
    {
        let d = [];
        for (let v = 0; v <= 30; v++) d.push(-1 + v / 15);
        n("guard", I_(d, [-1, -.9, -.5, 0, .5, .9, 1], (v, g, x) => {
            let y = -5e-4 + v * .0405,
                b = D_(y) + .0045 - g * .011,
                m = Math.min(cm(v), cm(g)),
                A = 0;
            for (let M = 0; M < 4; M++) {
                let E = (y - om[M].base[0]) / .0058;
                A += (M === 3 ? .8 : 1) * Math.exp(-E * E)
            }
            A = Math.min(1, A) * (1 - .55 * g * g), x.set(y, kv(y, b) + (m < 0 ? g > .95 ? -.008 : -.003 : (.0016 + .006 * A) * m), b);
            let _ = m < 0 ? .6 : .85 + 1.3 * A;
            return [Lv[0] * _, Lv[1] * _, Lv[2] * _]
        }))
    }
    for (let d = 0; d < 3; d++) n("bar", Lf(.001, -.034 - d * .015, .023 + d * .0025, .0052, .0019, Fv, kv));
    n("seam", Lf(0, -.0225, .027, .0013, 9e-4, kf.map(d => d * .8), kv, null, !1, Uv, [-1, 0, 1].map(d => d * .9))), n("heelPad", Lf(.013, -.03, .0135, .017, .0017, Fv, wC, null, !0));
    let s = [];
    for (let d = 0; d < 4; d++) {
        if (d === 0 && i.indexPoses) {
            for (let v of i.indexPoses) s.push(C_(om[0], v));
            continue
        }
        n("finger" + d, C_(om[d], i.fingers[d]))
    }
    n("thumb", MC(i.thumb)), n("web", SC(new ti(i.thumb[0][0], i.thumb[0][1], i.thumb[0][2]).normalize()));
    let o = new ti(i.forearm[0], i.forearm[1], i.forearm[2]).normalize(),
        r = i.sleeve || .36,
        a = .022,
        l = new vl().setFromUnitVectors(new ti(0, 0, 1), o),
        c = new vl,
        u = new vl,
        h = d => (u.slerpQuaternions(c, l, xl(.002, .042, d.z)), d.z -= a, d.applyQuaternion(u), d.z += a, d);
    {
        let v = new yl(24),
            g = new ti,
            x = [
                [-.0085, -.0015, Df, .6],
                [-.009, .0022, Df, 1.3],
                [-.006, .0026, Df, 1.3],
                [-.0052, .002, gl, .75],
                [.004, .0014, gl, 1],
                [.011, .0016, gl, .7],
                [.0122, .003, Df, 1.2],
                [.0305, .0032, Df, 1.2],
                [.0317, .0018, gl, .7],
                [.04, .002, gl, 1],
                [.054, .0024, gl, 1],
                [.058, .0026, kf, .7],
                [.058, -.004, gl, .4]
            ];
        for (let [y, b, m, A] of x)
            for (let _ = 0; _ < 24; _++) {
                let M = (_ + .5) / 24 * Math.PI * 2,
                    E = Math.sin(M);
                v.v(h(g.set((.0296 + b) * Ff(Math.cos(M), .8), (E >= 0 ? .0185 + b : .0204 + b) * Ff(E, .8), y)), m, A)
            }
        n("cuff", v.geo(!0))
    }
    n("strapTab", Lf(.009, .0215, .0135, .0076, .0017, d => d > .55 ? kf.map(v => v * .75) : [9, 9, 9.6], d => .0217 * Math.pow(1 - Math.pow(Math.min(.999, Math.abs(d / .0328)), 2.5), .4), h)), n("pullTab", Lf(.003, .004, .0065, .0115, .0022, pC, () => .022, h, !0));
    {
        let d = [];
        for (let z = 0; z < 24; z++) d.push(z * 15), (z === 4 || z === 16) && d.push(z * 15 + 11.5), (z === 5 || z === 17) && d.push(z * 15 + 3.5);
        d.sort((z, H) => z - H);
        let v = d.length,
            g = d.indexOf(75),
            x = d.indexOf(255),
            y = new yl(v),
            b = new ti,
            m = .04 + r,
            A = [
                [.0415, 0],
                [.04, 1],
                [.044, 2],
                [.049, 3],
                [.055, 3],
                [.061, 3],
                [.0655, 4],
                [.0685, 5]
            ],
            _ = [.1415, .143, .157, .1582, .1662, .1674, .181, .1825],
            M = _.slice(),
            E = Math.ceil((m - .074) / .0052);
        for (let z = 0; z <= E; z++) {
            let H = .074 + (m - .074) * z / E;
            _.some(O => Math.abs(O - H) < .0016) || M.push(H)
        }
        M.sort((z, H) => z - H);
        for (let z of M) A.push([z, 6]);
        let w = 0;
        for (let [z, H] of A)
            for (let O = 0; O < v; O++) {
                let q = d[O] * Math.PI / 180,
                    U, T = 1,
                    D = E_;
                if (H === 0) U = .0292, T = .4;
                else if (H === 1) U = .0372, T = 1.15;
                else if (H === 2) U = .0377, T = 1.1;
                else if (H === 3) {
                    let C = Math.cos(q * 12);
                    U = .0368 + .0012 * C, T = .62 + .26 * C
                } else if (H === 4) U = .0356, T = .55;
                else if (H === 5) U = .038, T = .9;
                else {
                    let C = (z - .0685) / (m - .0685),
                        G = .0048 * Math.exp(-Math.pow((C - .13) / .11, 2)),
                        j = .0048 * xl(.62, .85, C),
                        N = Math.pow(Math.abs(Math.sin(Math.PI * z / .027 + 1.7 * Math.sin(q + .5) + .8 * Math.sin(2 * q + 1.3))), .6) * 2 - 1.25,
                        Q = Math.pow(Math.abs(Math.sin(Math.PI * z / .034 + 1.9 * Math.sin(q - .8) + .7 * Math.sin(2 * q))), .6) * 2 - 1.25,
                        K = Math.sin(z * 40 + 2 * Math.sin(q * 2 + 1)) + .6 * Math.sin(3 * q + z * 25);
                    U = .0405 + .012 * Math.pow(C, .85) + .0025 * Math.exp(-Math.pow((z - .082) / .012, 2)) + G * N + j * Q + .0016 * K, T = .78 + .26 * xl(-1.1, .5, (G * N + j * Q) / (G + j + 8e-4)) + .04 * K;
                    let ie = vC(w);
                    z > .1575 && z < .167 ? (D = gC, T *= .85 + .25 * ie) : z > .1425 && z < .1815 && (D = mC, T *= .78 + .3 * ie)
                }
                H > 0 && (O === g || O === x ? (U += .0019, T *= 1.3) : (Math.abs(O - g) === 1 || Math.abs(O - x) === 1) && (T *= .52)), b.set(Math.cos(q) * U, Math.sin(q) * U * .84, z), y.v(b, D, T), w++
            }
        for (let z = 0; z < v; z++) y.v(b.set(0, 0, m + .006), E_, .3);
        y.collapse();
        let S = y.geo(!0);
        S.applyMatrix4(new rm().makeTranslation(0, 0, a).multiply(new rm().makeRotationFromQuaternion(l)).multiply(new rm().makeTranslation(0, 0, -a))), n("sleeve", S)
    }
    let p = {
        fabric: Ii(e),
        rubber: null,
        index: s.length ? s : null,
        knuckle: om[0].base.slice()
    };
    return i.mirror && (P_(p.fabric), p.index && p.index.forEach(P_), p.knuckle[0] *= -1), p
}
var hm = {
        model: [8, 8, 330, 84],
        maker: [8, 100, 560, 40],
        cal: [8, 146, 560, 40],
        prop: [8, 192, 700, 40],
        safe: [8, 240, 90, 34],
        semi: [110, 240, 90, 34],
        auto: [212, 240, 90, 34],
        rack: [8, 290, 300, 110],
        warn: [330, 290, 420, 110],
        optic: [580, 8, 300, 60],
        light: [580, 76, 300, 60],
        dots: [320, 240, 60, 34],
        r2: [8, 420, 56, 40],
        r4: [72, 420, 56, 40],
        r6: [136, 420, 56, 40],
        r8: [200, 420, 56, 40],
        r10: [264, 420, 56, 40],
        r12: [328, 420, 56, 40]
    },
    Uf = 1024,
    Nf = 512;

function TC() {
    let i = document.createElement("canvas");
    i.width = Uf, i.height = Nf;
    let e = i.getContext("2d");
    e.clearRect(0, 0, Uf, Nf), e.textBaseline = "middle";
    let t = (u, h, f, p, d = "left") => {
            let [v, g, x, y] = hm[u];
            e.font = f, e.fillStyle = p, e.textAlign = d, e.fillText(h, d === "left" ? v + 2 : v + x / 2, g + y / 2 + 1, x - 4)
        },
        n = '"PingFang SC", "PingFang SC", Arial, sans-serif',
        s = '"PingFang SC", "PingFang SC", monospace',
        o = '"PingFang SC", "PingFang SC", Impact, sans-serif',
        r = "rgba(196,198,194,0.92)";
    t("model", "PAC-9", `700 78px ${o}`, r), t("maker", "几猫兵工厂 · 港区装备", `600 30px ${n}`, r), t("cal", "CAL 5.8\xD740   SN PA-004217", `500 27px ${s}`, r), t("prop", "港务局装备 · 四号泊位武器库", `600 28px ${n}`, r), t("safe", "S", `700 30px ${n}`, r, "center"), t("semi", "1", `700 30px ${n}`, r, "center"), t("auto", "A", `700 30px ${n}`, "rgba(205,60,40,0.95)", "center"), t("rack", "B4-07", `800 104px ${o}`, "rgba(214,206,170,0.9)", "center");
    for (let u of [2, 4, 6, 8, 10, 12]) t("r" + u, "T" + u, `600 30px ${s}`, "rgba(190,192,188,0.85)", "center");
    t("optic", "HX-2 反射瞄具", `700 44px ${n}`, r, "center"), t("light", "900 LM  IPX8", `600 40px ${n}`, r, "center");
    {
        let [u, h] = hm.warn;
        e.fillStyle = r, e.textAlign = "left", e.font = `600 24px ${n}`, ["警告：存放前必须清空弹膛", "仅限授权突击队员使用", "港务安全规程 44/7"].forEach((f, p) => e.fillText(f, u + 2, h + 20 + p * 34))
    } {
        let [u, h, f, p] = hm.dots;
        e.fillStyle = r, e.beginPath(), e.arc(u + 12, h + p / 2, 7, 0, 7), e.fill(), e.fillStyle = "rgba(205,60,40,0.95)", e.beginPath(), e.arc(u + 40, h + p / 2, 7, 0, 7), e.fill()
    }
    e.globalCompositeOperation = "destination-out";
    let a = 7,
        l = () => (a = a * 16807 % 2147483647, a / 2147483647);
    for (let u = 0; u < 2600; u++) {
        e.fillStyle = `rgba(0,0,0,${.25+l()*.6})`;
        let h = l() < .9 ? 1 + l() * 1.5 : 2 + l() * 5;
        e.fillRect(l() * Uf, l() * Nf, h, h * (.4 + l()))
    }
    let c = new xs(i);
    return c.colorSpace = Vn, c.anisotropy = 8, c.generateMipmaps = !0, c.minFilter = Ln, c
}

function F_(i) {
    let e = [],
        t = [],
        n = [],
        s = [];
    for (let [l, c, u, h, f, p, d = 0] of i) {
        let [v, g, x, y] = hm[l], b = f * x / y, m = v / Uf, A = (v + x) / Uf, _ = 1 - g / Nf, M = 1 - (g + y) / Nf, E = e.length / 3, w;
        if (p === "L" ? w = [
                [c, u - f / 2, -(h + b / 2)],
                [c, u - f / 2, -(h - b / 2)],
                [c, u + f / 2, -(h - b / 2)],
                [c, u + f / 2, -(h + b / 2)]
            ] : p === "R" ? w = [
                [c, u - f / 2, -(h - b / 2)],
                [c, u - f / 2, -(h + b / 2)],
                [c, u + f / 2, -(h + b / 2)],
                [c, u + f / 2, -(h - b / 2)]
            ] : w = [
                [c - b / 2, u, -(h - f / 2)],
                [c + b / 2, u, -(h - f / 2)],
                [c + b / 2, u, -(h + f / 2)],
                [c - b / 2, u, -(h + f / 2)]
            ], d) {
            let z = Math.cos(d),
                H = Math.sin(d),
                O = u,
                q = -h;
            for (let U of w) {
                let T = U[1] - O,
                    D = U[2] - q;
                U[1] = O + T * z - D * H, U[2] = q + T * H + D * z
            }
        }
        for (let z of w) e.push(z[0], z[1], z[2]);
        t.push(m, M, A, M, A, _, m, _);
        let S = p === "L" ? [-1, 0, 0] : p === "R" ? [1, 0, 0] : [0, 1, 0];
        for (let z = 0; z < 4; z++) n.push(S[0], S[1], S[2]);
        s.push(E, E + 1, E + 2, E, E + 2, E + 3)
    }
    let o = new nt;
    o.setAttribute("position", new He(e, 3)), o.setAttribute("uv", new He(t, 2)), o.setAttribute("normal", new He(n, 3)), o.setIndex(s);
    let r = new Qt({
            map: TC(),
            transparent: !0,
            roughness: .62,
            metalness: 0,
            depthWrite: !1,
            polygonOffset: !0,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            side: Sn
        }),
        a = new Qe(o, r);
    return a.renderOrder = 2, a
}

function U_(i, e) {
    let t = new ji;
    i.forEach((r, a) => a ? t.lineTo(r[0], r[1]) : t.moveTo(r[0], r[1])), t.closePath();
    let n = new H0(t);
    n.translate(0, 0, -e);
    {
        let r = 1e9,
            a = -1e9,
            l = 1e9,
            c = -1e9;
        for (let f of i) r = Math.min(r, f[0]), a = Math.max(a, f[0]), l = Math.min(l, f[1]), c = Math.max(c, f[1]);
        let u = n.attributes.position,
            h = n.attributes.uv;
        for (let f = 0; f < u.count; f++) h.setXY(f, (u.getX(f) - r) / (a - r), (u.getY(f) - l) / (c - l))
    }
    let s = new zn({
            transparent: !0,
            premultipliedAlpha: !0,
            depthWrite: !1,
            side: Sn,
            uniforms: {
                uBright: {
                    value: 7
                },
                uSun: {
                    value: Mn.dir.clone()
                },
                uSunCol: {
                    value: Mn.color.clone()
                },
                uZen: {
                    value: en.zenith.clone()
                },
                uHor: {
                    value: en.horizonAway.clone()
                },
                uTilt: {
                    value: .1
                }
            },
            vertexShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uTilt;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz;
        vFwd = (modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz; vRight = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz; vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vWN = normalize(mat3(modelMatrix) * normalize(vec3(0.0, -uTilt, 1.0)));   // real sights tilt the glass a few degrees
        gl_Position = projectionMatrix * mv;
      }`,
            fragmentShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uBright; uniform vec3 uSun, uSunCol, uZen, uHor;
      void main(){
        vec3 d = normalize(vView), fw = normalize(vFwd);
        float k = max(dot(d, fw), 1e-3);
        vec2 a = vec2(dot(d, normalize(vRight)), dot(d, normalize(vUp))) / k;      // tangent of the angle off the bore axis
        float r = length(a), px = max(fwidth(r), 1e-5);
        float dotR = max(0.0011, px * 0.9), ringW = max(0.00045, px * 0.6);
        float dotI = 1.0 - smoothstep(dotR - px, dotR + px, r);
        float ring = 1.0 - smoothstep(ringW - px * 0.5, ringW + px, abs(r - 0.0128));
        float ang = atan(a.y, a.x);
        float tick = (1.0 - smoothstep(0.0, px * 1.2 + 0.0004, min(abs(a.x), abs(a.y)))) * step(0.0128, r) * (1.0 - smoothstep(0.0165, 0.0175, r));
        float ret = clamp(dotI + ring * 0.8 + tick * 0.8, 0.0, 1.0);
        // faint halo so the bloom has something to hold on to
        ret += 0.05 * exp(-r * r / 0.00002);
        vec3 retCol = vec3(1.0, 0.11, 0.045) * ret * uBright;
        // coated glass: sky/sun reflection through a ruby-teal dichroic coating, stronger at grazing angles
        vec3 wv = normalize(vWPos - cameraPosition); vec3 n = normalize(vWN); if (dot(n, wv) > 0.0) n = -n;
        vec3 rf = reflect(wv, n);
        float fres = pow(1.0 - abs(dot(wv, n)), 3.0);
        vec3 sky = mix(uHor, uZen, clamp(rf.y * 1.4 + 0.2, 0.0, 1.0));
        float sd = max(dot(rf, uSun), 0.0);
        sky += uSunCol * (pow(sd, 6.0) * 0.6 + pow(sd, 90.0) * 6.0);
        // blue -> amber dichroic coating across the glass, a soft diagonal sheen band, and a thin dark edge
        float band = smoothstep(0.25, 0.5, vUv.x * 0.6 + vUv.y) * (1.0 - smoothstep(0.62, 0.95, vUv.x * 0.6 + vUv.y));
        vec3 coat = mix(vec3(0.30, 0.50, 0.95), vec3(1.0, 0.62, 0.28), clamp(fres * 2.2 + vUv.y * 0.75 - 0.15, 0.0, 1.0));
        vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.90, 1.0, max(e.x, e.y));
        float refl = 0.12 + 0.60 * fres + 0.07 * band;
        // faint emitter glow that stays visible off-axis (what you see of a powered sight from the hip)
        vec2 eg = (vUv - vec2(0.5, 0.16)) * vec2(1.0, 1.6); retCol += vec3(1.0, 0.10, 0.04) * 0.20 * exp(-dot(eg, eg) * 60.0) * (1.0 - smoothstep(0.985, 0.9995, k));
        vec3 col = (sky * 1.5 + vec3(0.03, 0.035, 0.045)) * coat * refl * (1.0 - edge) + retCol;
        float alpha = clamp(0.20 + 0.32 * fres + 0.05 * band + 0.6 * edge, 0.0, 0.94);
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
        }),
        o = new Qe(n, s);
    return o.renderOrder = 5, o
}

function N_() {
    let i = [],
        e = [],
        t = [],
        n = [],
        s = (d, v, g, x, y) => {
            let b = i.length / 3;
            for (let m of [d, v, g, x]) i.push(m[0], m[1], m[2]);
            e.push(0, 0, 1, 0, 1, 1, 0, 1);
            for (let m = 0; m < 4; m++) t.push(y);
            n.push(b, b + 1, b + 2, b, b + 2, b + 3)
        };
    s([-.13, -.13, -.03], [.13, -.13, -.03], [.13, .13, -.03], [-.13, .13, -.03], 0), s([-.13 * .7, -.13 * .7, -.09], [.13 * .7, -.13 * .7, -.09], [.13 * .7, .13 * .7, -.09], [-.13 * .7, .13 * .7, -.09], 0);
    let r = .065,
        a = .34;
    s([-r, 0, .01], [r, 0, .01], [r, 0, -a], [-r, 0, -a], 1), s([0, -r, .01], [0, r, .01], [0, r, -a], [0, -r, -a], 1);
    let l = .17,
        c = .05,
        u = .035;
    s([-l, -c, u], [l, -c, u], [l, c, u], [-l, c, u], 2), s([-l, 0, u + c], [l, 0, u + c], [l, 0, u - c], [-l, 0, u - c], 2), s([-.05, -.05, -.01], [.05, -.05, -.01], [.05, .05, -.01], [-.05, .05, -.01], 3), s([-.03, -.03, .02], [.03, -.03, .02], [.03, .03, .02], [-.03, .03, .02], 4);
    let h = new nt;
    h.setAttribute("position", new He(i, 3)), h.setAttribute("uv", new He(e, 2)), h.setAttribute("aType", new He(t, 1)), h.setIndex(n);
    let f = new zn({
            transparent: !0,
            depthWrite: !1,
            blending: hr,
            side: Sn,
            uniforms: {
                uSeed: {
                    value: 0
                },
                uInt: {
                    value: 0
                },
                uHeat: {
                    value: 0
                },
                uJet: {
                    value: 1
                }
            },
            vertexShader: `attribute float aType; varying vec2 vUv; varying float vType;
      void main(){ vUv = uv; vType = aType; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `varying vec2 vUv; varying float vType; uniform float uSeed, uInt, uHeat, uJet;
      float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x); float I = 0.0; vec3 tintc = vec3(1.0, 0.50, 0.16);
        if (vType < 0.5) {
          float n1 = 3.0 + floor(h1(1.0) * 3.0), n2 = 5.0 + floor(h1(2.0) * 4.0);
          float pet = pow(abs(cos(a * n1 * 0.5 + h1(3.0) * 6.283)), 5.0) * (0.55 + 0.45 * h1(4.0));
          pet += pow(abs(cos(a * n2 * 0.5 + h1(5.0) * 6.283)), 14.0) * 0.55;
          float reach = 0.35 + 0.65 * pet;
          I = (0.25 + pet) * smoothstep(reach, reach * 0.15, r) * (0.75 + 0.25 * sin(r * 26.0 + h1(6.0) * 20.0));
        } else if (vType < 1.5) {
          float y = vUv.y, x = p.x * (1.0 + 0.5 * sin(y * 17.0 + h1(7.0) * 30.0) * y);
          float wdt = mix(0.20, 0.75, smoothstep(0.0, 0.35, y)) * (1.0 - y * 0.75);
          I = exp(-x * x / (wdt * wdt * 0.35)) * pow(1.0 - y, 1.4) * (0.7 + 0.3 * sin(y * 31.0 + h1(8.0) * 9.0)) * 0.9;
        } else if (vType < 2.5) {
          float u = abs(p.x), len = 0.55 + 0.45 * h1(9.0 + step(0.0, p.x));
          float wv = p.y * (1.0 + u * 3.0) + 0.12 * sin(u * 14.0 + h1(10.0) * 20.0) * u;
          I = exp(-wv * wv * 22.0) * smoothstep(len, 0.06, u) * smoothstep(0.02, 0.10, u) * 0.85 * uJet;
        } else if (vType < 3.5) {
          I = exp(-r * r * 5.0) * 2.4 * smoothstep(1.0, 0.6, r); tintc = vec3(1.0, 0.82, 0.58);
        } else {
          gl_FragColor = vec4(vec3(1.0, 0.28, 0.06) * exp(-r * r * 4.0) * smoothstep(1.0, 0.5, r) * uHeat, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }
        vec3 col = mix(tintc, vec3(1.0, 0.90, 0.70), clamp(I * I * 0.7, 0.0, 1.0)) * I * uInt;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
        }),
        p = new Qe(h, f);
    return p.renderOrder = 10, p.frustumCulled = !1, p
}
var Wv = {
        value: 1
    },
    AC = `
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; uniform float uKind; uniform float uRain;
float dh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float dn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dh3(i), dh3(i + vec3(1,0,0)), f.x), mix(dh3(i + vec3(0,1,0)), dh3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh3(i + vec3(0,0,1)), dh3(i + vec3(1,0,1)), f.x), mix(dh3(i + vec3(0,1,1)), dh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
vec2 dh2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
vec2 dDrops(vec2 uv, float cell, float seed){ vec2 g = uv / cell, i = floor(g), f = fract(g); float best = 0.0;
  for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) { vec2 o = vec2(float(a), float(b)); vec2 r = dh2(i + o + seed);
    float keep = step(0.70, fract(r.x * 7.31 + r.y * 3.17)); vec2 c = o + 0.2 + 0.6 * r; float rad = (0.16 + 0.22 * fract(r.x * 13.7)) * keep;
    float d = length(f - c); best = max(best, sqrt(max(rad * rad - d * d, 0.0))); }
  return vec2(best * cell, step(1e-6, best)); }
vec3 dBump(vec3 N, float h){ vec3 dpdx = dFdx(-vViewPosition), dpdy = dFdy(-vViewPosition); float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx); float det = dot(dpdx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * N - g); }
`,
    RC = `
vec3 dP = vObjP; vec3 dAn = abs(vONrm);
vec2 dUV = (dAn.y > dAn.x && dAn.y > dAn.z) ? dP.xz : (dAn.x > dAn.z ? dP.zy : dP.xy);
float dSm = dn3(dP * 36.0), dSm2 = dn3(dP * 150.0 + 7.0), dFine = dn3(dP * 2400.0);
float dHt = 0.0, dR = 0.0;
if (uKind < 0.5) {
  float scuff = smoothstep(0.70, 0.9, dn3(dP * vec3(420.0, 420.0, 26.0) + 3.0));
  float smudge = smoothstep(0.55, 0.8, dn3(dP * 55.0 + 11.0));
  dR = (dSm - 0.5) * 0.20 + (dSm2 - 0.5) * 0.10 + (dFine - 0.5) * 0.08 + scuff * 0.18 - smudge * 0.12;
  dHt = dFine * 0.000010 - scuff * 0.000015;
} else if (uKind < 1.5) {
  float ring = sin(dP.z * 5200.0) * 0.5 + 0.5, streak = dn3(vec3(dP.z * 950.0, 1.0, 2.0));
  dR = (streak - 0.5) * 0.26 + (dSm - 0.5) * 0.14 + (dFine - 0.5) * 0.10;
  dHt = ring * 0.000014 + dFine * 0.000010;
} else {
  float st = dn3(dP * 1500.0) * 0.6 + dn3(dP * 3100.0 + 5.0) * 0.4;
  dR = (dSm - 0.5) * 0.18 + (st - 0.5) * 0.14 - smoothstep(0.6, 0.85, dSm2) * 0.10;
  dHt = st * 0.000075;
}
float dUp = smoothstep(0.30, 0.75, vWNrm.y) * uRain;
vec2 dD1 = dDrops(dUV, 0.0046, 3.0), dD2 = dDrops(dUV + 0.31, 0.0023, 9.0);
float dDrop = max(dD1.y, dD2.y) * dUp, dDropH = max(dD1.x, dD2.x) * dUp;
float dWet = dUp * (0.5 + 0.5 * smoothstep(0.3, 0.7, dSm));
roughnessFactor = clamp(roughnessFactor + dR, 0.10, 1.0);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.5, dWet);
roughnessFactor = mix(roughnessFactor, 0.10, dDrop);
diffuseColor.rgb *= 1.0 - 0.18 * dWet;
`,
    CC = `
normal = dBump(normal, dHt + dDropH * 0.32);
`;

function Bf(i, e) {
    return i.onBeforeCompile = t => {
        t.uniforms.uKind = {
            value: e
        }, t.uniforms.uRain = Wv, t.vertexShader = t.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vObjP = position; vONrm = normal; vWNrm = normalize(mat3(modelMatrix) * normal);`), t.fragmentShader = t.fragmentShader.replace("#include <common>", `#include <common>
` + AC).replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
` + RC).replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
` + CC)
    }, i.customProgramCacheKey = () => "pac9-detail-" + e, i
}
var gi = W,
    fm = Lt,
    Gv = 30,
    B_ = 150,
    O_ = 720,
    H_ = 26,
    V_ = 300,
    eu = {
        p: [.118, -.122, -.275],
        r: [.034, .085, -.03]
    },
    qv = {
        p: [0, -mi.sightY, -.135],
        r: [0, 0, 0]
    },
    tu = {
        p: [-.035, .004, .03],
        r: [-.04, .62, .26]
    },
    nu = {
        p: [-.03, .1, -.02],
        r: [.46, .22, -.8]
    },
    W_ = 2.1,
    G_ = 2.72,
    Yo = i => (i = Fo(i), i * i * i * (i * (6 * i - 15) + 10)),
    pa = (i, e) => ({
        x: 0,
        v: 0,
        k: i,
        c: e
    });

function ma(i, e, t) {
    let n = t > .012 ? Math.ceil(t / .008) : 1,
        s = t / n;
    for (let o = 0; o < n; o++) i.v += ((e - i.x) * i.k - i.v * i.c) * s, i.x += i.v * s;
    return i.x
}
var i0 = (i, e, t, n = "XYZ") => new fm().setFromEuler(new In(i, e, t, n));
async function dm(i) {
    let e = new wt;
    e.name = "viewmodel-pac9";
    let t = w_(),
        n = {
            anodized_black: 2,
            gunmetal: 2,
            brass: 4,
            glove_fabric: 3,
            rubber: 4
        },
        s = Me => i.mats.get(Me, {
            triplanar: !0,
            vertexColors: !0,
            scale: n[Me] || 1
        }),
        o = (Me, we) => {
            let be = new Qe(Me, we);
            return be.castShadow = !1, be.receiveShadow = !0, be.frustumCulled = !1, be
        },
        r = new Qt({
            color: new Ve(.0085, .009, .0105),
            roughness: .4,
            metalness: .45,
            vertexColors: !0
        });
    r.name = "pac9_anodised", Bf(r, 0);
    let a = new Qt({
        color: 16777215,
        roughness: .92,
        metalness: 0,
        vertexColors: !0
    });
    a.name = "pac9_matte";
    let l = new Qt({
        color: new Ve(.016, .016, .0165),
        roughness: .5,
        metalness: .7,
        vertexColors: !0
    });
    l.name = "pac9_phosphate", Bf(l, 1);
    let c = new Qt({
        color: new Ve(.0125, .0128, .0135),
        roughness: .62,
        metalness: 0,
        vertexColors: !0
    });
    c.name = "pac9_polymer", Bf(c, 2);
    let u = new Qt({
        color: new Ve(.105, .08, .05),
        roughness: .62,
        metalness: 0,
        vertexColors: !0
    });
    u.name = "pac9_polymer_tan", Bf(u, 2), e.add(o(t.ano, r), o(t.gun, l), o(t.poly, c), o(t.plain, a));
    let h = o(t.bolt, l);
    e.add(h);
    let f = new wt,
        p = new gi().fromArray(mi.magPos);
    f.position.copy(p);
    let d = o(t.round, s("brass"));
    f.add(o(t.mag, u), d), e.add(f);
    let v = null,
        g = null,
        x = null;
    try {
        v = F_([
            ["model", -.0168, -.0315, .064, .0095, "L"],
            ["maker", -.0168, -.042, .064, .003, "L"],
            ["cal", -.0168, -.0465, .064, .0028, "L"],
            ["prop", -.0168, -.071, .066, .0026, "L"],
            ["auto", -.0168, -.027, -.0335, .0036, "L"],
            ["semi", -.0168, -.0262, -.049, .0036, "L"],
            ["safe", -.0168, -.0362, -.062, .0036, "L"],
            ["rack", -.0168, -.004, -.205, .02, "L"],
            ["warn", -.0181, -.01, .03, .0062, "L"],
            ["optic", -.0195, .0735, .021, .0024, "L"],
            ["model", .0168, -.0315, .068, .0095, "R"],
            ["warn", .0168, -.066, .066, .0075, "R"],
            ["rack", .0168, -.004, -.205, .02, "R"],
            ["auto", .0168, -.027, -.0335, .0036, "R"],
            ["safe", .0168, -.0362, -.062, .0036, "R"],
            ["optic", .0195, .0735, .021, .0024, "R"],
            ["cal", .0181, .0245, -.055, .0026, "R"],
            ["r2", 0, .04365, -.0816, .003, "T"],
            ["r4", 0, .04365, -.0616, .003, "T"],
            ["r6", 0, .04365, .0584, .003, "T"],
            ["r8", 0, .04365, .0784, .003, "T"],
            ["r10", 0, .04365, .0984, .003, "T"],
            ["r12", 0, .04365, .1184, .003, "T"]
        ]), v.castShadow = !1, v.receiveShadow = !0, v.frustumCulled = !1, e.add(v)
    } catch (Me) {
        console.warn("[weapon] markings skipped: " + Me)
    }
    g = U_(mi.window.map(Me => [Me[0] * 1.01, (Me[1] - mi.sightY) * 1.01 + mi.sightY]), mi.lensF + .0025), g.frustumCulled = !1, e.add(g), x = N_(), x.position.fromArray(mi.muzzle), x.visible = !1, e.add(x);
    let y = (Me, we, be) => {
            let Oe = new gi(we[0], we[1], we[2]).normalize().applyQuaternion(Me.clone().invert());
            return be && (Oe.x *= -1), [Oe.x, Oe.y, Oe.z]
        },
        b = i0(-.24, 0, 0).multiply(i0(0, 0, -Math.PI / 2)),
        m = Vv({
            mirror: !1,
            fingers: [null, [.62, 1.72, .8, 0],
                [.68, 1.7, .8, -.03],
                [.74, 1.66, .8, -.09]
            ],
            indexPoses: [
                [.1, .16, .1, .05],
                [.46, 1.15, .5, 0]
            ],
            thumb: [y(b, [-.85, .05, -.5]), y(b, [-.6, -.05, -.8]), y(b, [-.05, -.2, -.97])],
            forearm: y(b, [.27, -.44, .86]),
            sleeve: .34
        }),
        A = new wt;
    A.quaternion.copy(b), A.position.fromArray(mi.grip).sub(new gi(.006, -.031, -.085).applyQuaternion(b));
    let _ = s("glove_fabric");
    A.add(o(m.fabric, _));
    let M = o(m.index[0].clone(), _);
    A.add(M), e.add(A);
    let E = m.index[0].attributes,
        w = m.index[1].attributes,
        S = -1;

    function z(Me) {
        if (Math.abs(Me - S) < .004) return;
        S = Me;
        let we = M.geometry.attributes.position,
            be = M.geometry.attributes.normal,
            Oe = E.position.array,
            pt = w.position.array,
            ut = E.normal.array,
            nn = w.normal.array;
        for (let bt = 0; bt < Oe.length; bt++) we.array[bt] = Oe[bt] + (pt[bt] - Oe[bt]) * Me, be.array[bt] = ut[bt] + (nn[bt] - ut[bt]) * Me;
        we.needsUpdate = !0, be.needsUpdate = !0
    }
    let H = i0(0, 0, Math.PI / 2).multiply(i0(.06, 0, 0)),
        O = Vv({
            mirror: !0,
            fingers: [
                [1.27, 1.42, .75, .02],
                [1.3, 1.45, .75, 0],
                [1.3, 1.45, .75, -.02],
                [1.33, 1.45, .75, -.05]
            ],
            thumb: [y(H, [0, .25, -.97], !0), y(H, [.05, .1, -.99], !0), y(H, [0, 0, -1], !0)],
            forearm: y(H, [-.5, -.35, .79], !0),
            sleeve: .34
        }),
        q = new wt;
    q.add(o(O.fabric, _)), e.add(q);
    let U = new gi(0, -.015, -.055),
        T = (Me, we, be = U) => ({
            q: Me.clone(),
            p: new gi(we[0], we[1], we[2]).sub(be.clone().applyQuaternion(Me))
        }),
        D = (Me, we, be, Oe, pt = null) => ({
            q: pt ? pt.clone() : Me.q.clone(),
            p: Me.p.clone().add(new gi(we, be, Oe))
        }),
        C = i0(0, 0, Math.PI / 2).multiply(i0(.12, 0, 0)),
        G = T(H, [-.015, -.062, -.236]),
        j = T(C, [-.0135, -.15, -.0745]),
        N = D(j, -.035, -.02, .01),
        Q = D(j, -.06, -.3, .13, C.clone().multiply(i0(-.5, 0, .25))),
        K = D(j, 0, -.035, .004),
        ie = D(j, -.004, -.06, 0),
        F = D(j, 0, -.012, 0),
        X = i0(-.6, 0, 0).multiply(new fm().setFromRotationMatrix(new Ye().makeBasis(new gi(0, 0, 1), new gi(-1, 0, 0), new gi(0, -1, 0)))),
        ne = T(X, [mi.handlePos[0] - .004, mi.handlePos[1], mi.handlePos[2]], new gi(0, -.024, -.118)),
        re = D(ne, 0, 0, mi.boltTravel),
        $ = [
            [0, G],
            [.1, G],
            [.36, N],
            [.44, j],
            [.5, j],
            [.8, Q],
            [.98, Q],
            [1.28, K],
            [1.35, j],
            [1.45, ie],
            [1.52, F],
            [1.62, j],
            [1.7, N],
            [2.02, G],
            [9, G]
        ],
        ue = [...$.slice(0, 12), [1.7, N],
            [1.96, ne],
            [2.02, ne],
            [2.14, re],
            [2.19, re],
            [2.26, ne],
            [2.36, ne],
            [2.66, G],
            [9, G]
        ],
        me = .47,
        ee = 1.345,
        B = 2.02,
        P = 2.14,
        V = 2.19,
        Y = new gi,
        L = new fm,
        Z = new fm,
        J = new gi,
        oe = new gi,
        fe = new gi;

    function le(Me, we) {
        let be = 0;
        for (; be < Me.length - 2 && we > Me[be + 1][0];) be++;
        let Oe = Me[be],
            pt = Me[be + 1],
            ut = Yo((we - Oe[0]) / Math.max(1e-4, pt[0] - Oe[0]));
        Y.copy(Oe[1].p).lerp(pt[1].p, ut), L.copy(Oe[1].q).slerp(pt[1].q, ut)
    }
    q.position.copy(G.p), q.quaternion.copy(G.q);
    let R = C.clone().invert();
    e.traverse(Me => {
        Me.layers.set(zc)
    }), i.camera.add(e);
    let I = Object.values(t).reduce((Me, we) => Me + Kc(we), 0) + Kc(m.fabric) + Kc(m.index[0]) + Kc(O.fabric) + (v ? Kc(v.geometry) : 0) + 2,
        se = 0;
    e.traverse(Me => {
        Me.isMesh && se++
    }), console.log(`[weapon] ${mi.name}: ${Math.round(I)} tris, ${se} meshes (flash only while firing)`);
    let ae = i.rng && i.rng.fork ? i.rng.fork() : Math.random,
        k = {
            t: 0,
            cooldown: 0,
            prevFire: !1,
            dryDone: !1,
            autoReload: -1,
            reload: null,
            burst: 0,
            lastShot: -9,
            bloom: 0,
            heat: 0,
            smoke: 0,
            smokeTick: 0,
            adsLin: 0,
            adsE: 0,
            sprintT: 0,
            reloadW: 0,
            rackW: 0,
            bobPhase: 0,
            bobAmt: 0,
            finger: 0,
            boltT: 9,
            boltLocked: !1,
            flashT: 0,
            flashDur: .05,
            recPhase: 0,
            wasGround: !0,
            lastVy: 0,
            spreadS: .0125,
            idleT: 0,
            inspect: -1,
            kZ: pa(520, 30),
            kP: pa(380, 26),
            kY: pa(300, 22),
            kR: pa(300, 20),
            swY: pa(110, 15),
            swP: pa(110, 15),
            jY: pa(140, 13),
            jP: pa(140, 13),
            bump: pa(600, 30)
        },
        ce = {
            freeze: !1,
            reloadT: null,
            empty: !1,
            flash: !1,
            noFire: !1
        },
        ve = {
            name: mi.name,
            kind: "pac9",
            ammo: Gv,
            magSize: Gv,
            reserve: Gv * 4,
            state: "idle",
            ads: 0,
            spread: .0125,
            damage: H_,
            rpm: O_,
            root: e,
            debug: ce,
            info: {
                tris: Math.round(I),
                meshes: se
            },
            update: Xe,
            reset: _e,
            setVisible(Me) {
                e.visible = !!Me
            },
            muzzleWorld: Re,
            reloadNow: Fe,
            cancelReload() {
                k.reload = null, k.reloadW = 0, k.rackW = 0
            },
            addAmmo(Me) {
                ve.reserve += Me
            },
            setWetness(Me) {
                Wv.value = Math.max(0, Math.min(1, +Me || 0))
            },
            snap() {
                k.adsLin = i.input.ads ? 1 : 0;
                for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) k[Me].x = 0, k[Me].v = 0;
                k.sprintT = i.player.sprinting ? 1 : 0
            }
        };

    function _e() {
        ve.ammo = Gv, ve.reserve = Gv * 4, ve.state = "idle", ve.ads = 0, Object.assign(k, {
            cooldown: 0,
            prevFire: !1,
            dryDone: !1,
            autoReload: -1,
            reload: null,
            burst: 0,
            lastShot: -9,
            bloom: 0,
            heat: 0,
            smoke: 0,
            adsLin: 0,
            adsE: 0,
            sprintT: 0,
            reloadW: 0,
            boltT: 9,
            boltLocked: !1,
            flashT: 0,
            idleT: 0,
            inspect: -1
        });
        for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) k[Me].x = 0, k[Me].v = 0;
        d.visible = !0, f.visible = !0, f.position.copy(p), f.quaternion.identity(), q.position.copy(G.p), q.quaternion.copy(G.q)
    }
    let Te = new Ye;

    function Pe(Me, we) {
        e.updateMatrix(), we.fromArray(Me).applyMatrix4(e.matrix);
        let be = i.camera,
            Oe = Math.tan(be.fov * Math.PI / 360) / Math.tan(i.viewCamera.fov * Math.PI / 360);
        return we.x *= Oe, we.y *= Oe, we.applyQuaternion(be.quaternion).add(be.position)
    }

    function Re(Me = new gi) {
        return Pe(mi.muzzle, Me)
    }

    function Fe() {
        if (k.reload || ve.ammo >= ve.magSize || ve.reserve <= 0) return !1;
        let Me = ve.ammo <= 0;
        return k.reload = {
            t: 0,
            T: Me ? G_ : W_,
            empty: Me,
            f: {}
        }, k.autoReload = -1, i.events.emit("weapon:reload", {
            phase: "start",
            empty: Me,
            w: "pac9"
        }), !0
    }
    let ze = new gi,
        We = new gi,
        Ne = new gi,
        dt = new gi,
        xe = new gi,
        Ie = new gi;

    function Be() {
        let Me = i.player,
            we = i.camera;
        ve.ammo--, k.burst++, k.lastShot = k.t, k.heat = Math.min(1.3, k.heat + .05);
        let be = ve.spread,
            Oe = ae() * Math.PI * 2,
            pt = Math.tan(be) * Math.sqrt(ae());
        ze.set(Math.cos(Oe) * pt, Math.sin(Oe) * pt, -1).normalize().applyQuaternion(we.quaternion), Ie.copy(Me.eye || we.position);
        let ut = null;
        try {
            ut = i.combat.playerShot(Ie, ze, {
                damage: H_,
                range: V_
            })
        } catch {}
        ut && ut.point ? Ne.copy(ut.point) : Ne.copy(Ie).addScaledVector(ze, V_), Re(We);
        let nn = i.fx;
        nn && (nn.tracer && nn.tracer(We, Ne), nn.shell && (Pe(mi.eject, dt), xe.set(2 + ae() * 1.2, 1.2 + ae() * .8, .5 - ae() * .6).applyQuaternion(we.quaternion), Me.vel && xe.add(Me.vel), nn.shell(dt, xe))), i.render && i.render.lightPool && i.render.lightPool.flash(We, 16756832, 45, 9, .05), i.events.emit("weapon:fire", {
            origin: Ie,
            dir: ze,
            muzzle: We,
            ads: k.adsE,
            w: "pac9"
        });
        let bt = bi(1, .55, k.adsE) * (Me.crouching ? .85 : 1),
            Os = k.burst,
            pn = Os <= 9 ? 1 : .38,
            Ti = (Os < 4 ? (ae() - .5) * .0022 : Math.sin(Os * .57 + k.recPhase) * .0042 + (ae() - .5) * .002) * bt;
        Me.addRecoil && Me.addRecoil(.0068 * pn * bt * (.85 + ae() * .3), Ti), Me.addShake && Me.addShake(.12 * bt), k.kZ.v += 1.5 * bi(1, .6, k.adsE), k.kP.v += 1.5 * bt, k.kY.v += (ae() - .5) * 1 * bt, k.kR.v += (ae() - .5) * 1.8 * bt, k.bloom = Math.min(1, k.bloom + .17), k.flashT = k.flashDur = .036 + ae() * .02;
        let ho = x.material.uniforms;
        ho.uSeed.value = ae() * 100, ho.uJet.value = .6 + ae() * .6, x.rotation.z = (ae() - .5) * .4;
        let Rs = (.8 + ae() * .5) * bi(1, .62, k.adsE);
        x.scale.set(Rs, Rs, Rs * (.8 + ae() * .5)), k.boltT = 0, ve.ammo <= 0 && (k.boltLocked = !0, d.visible = !1)
    }

    function Xe(Me) {
        let we = i.player,
            be = i.input;
        if (!we || !be || !we.alive) {
            k.prevFire = !1, x && (x.visible = !1);
            return
        }
        k.t += Me;
        let Oe = !!be.fire && e.visible && !ce.noFire,
            pt = Oe && !k.prevFire;
        k.prevFire = Oe, Oe || (k.dryDone = !1);
        let ut = !!we.sprinting && !Oe && !be.ads && !k.reload;
        k.sprintT = kn(k.sprintT, ut ? 1 : 0, 9, Me), be.pressed && be.pressed("reload") && Fe(), k.autoReload >= 0 && (k.autoReload -= Me, k.autoReload < 0 && Fe());
        let nn = 0;
        if (ce.reloadT != null && !k.reload && (k.reload = {
                t: 0,
                T: ce.empty ? G_ : W_,
                empty: ce.empty,
                f: {}
            }), k.reload) {
            let Je = k.reload;
            ce.reloadT != null ? Je.t = ce.reloadT : Je.t += Me;
            let Pt = Je.t,
                Vt = (Tt, Ai) => Pt >= Ai && !Je.f[Tt] ? (Je.f[Tt] = 1, i.events.emit("weapon:reload", {
                    phase: Tt,
                    empty: Je.empty,
                    w: "pac9"
                }), !0) : !1;
            if (Vt("magout", me) && (k.bump.v -= .25), Pt > .86 && !Je.f.fresh && (Je.f.fresh = 1, d.visible = !0), Vt("magin", ee)) {
                k.bump.v += .55;
                let Tt = Math.min(ve.magSize - ve.ammo, ve.reserve);
                ve.ammo += Tt, ve.reserve -= Tt, Je.empty || (k.boltLocked = !1)
            }
            Pt >= 1.5 && !Je.f.tap && (Je.f.tap = 1, k.bump.v += .4), Je.empty && (Pt >= B && (nn = Pt < P ? Yo((Pt - B) / (P - B)) : Pt < V ? 1 : Math.max(0, 1 - (Pt - V) / .035)), Vt("bolt", V) && (k.boltLocked = !1, k.bump.v += .3, k.kZ.v -= .5)), le(Je.empty ? ue : $, Pt), q.position.copy(Y), q.quaternion.copy(L), Pt >= me && Pt < ee ? (Z.copy(L).multiply(R), f.quaternion.copy(Z), f.position.copy(p).sub(j.p).applyQuaternion(Z).add(Y)) : (f.quaternion.identity(), f.position.copy(p));
            let ss = Yo(Pt / .3),
                Hs = 1 - Yo((Pt - (Je.T - .46)) / .4);
            k.reloadW = Math.min(ss, Hs), k.rackW = Je.empty ? Yo((Pt - 1.62) / .3) * Hs : 0, Pt >= Je.T && ce.reloadT == null && (k.reload = null, k.reloadW = 0, k.rackW = 0, i.events.emit("weapon:reload", {
                phase: "done",
                w: "pac9"
            }), q.position.copy(G.p), q.quaternion.copy(G.q))
        }
        k.cooldown -= Me;
        let bt = !k.reload && k.sprintT < .45;
        if (Oe && bt)
            if (ve.ammo > 0) {
                let Je = 0;
                for (; k.cooldown <= 0 && ve.ammo > 0 && Je < 3;) Be(), k.cooldown += 60 / O_, Je++
            } else k.dryDone || (k.dryDone = !0, i.events.emit("weapon:dry", {
                w: "pac9"
            }), k.bump.v -= .08, ve.reserve > 0 && (k.autoReload = .32));
        k.cooldown < 0 && (k.cooldown = Math.max(k.cooldown, -.001)), k.t - k.lastShot > .24 && (k.burst > 0 && (k.recPhase = ae() * 6.28), k.burst = 0), k.bloom = Math.max(0, k.bloom - Me * 1.5), k.t - k.lastShot > .11 && k.t - k.lastShot < .11 + Me * 1.5 && k.heat > .4 && (k.smoke = Math.min(1.6, k.heat * 1.3)), k.smoke > 0 && (k.smoke -= Me, k.smokeTick -= Me, k.smokeTick <= 0 && i.fx && i.fx.smoke && (k.smokeTick = .085, Re(We), i.fx.smoke(We, {
            size: .1 + k.smoke * .06,
            life: 1.3,
            rise: .5,
            count: 1,
            alpha: .22
        }))), k.heat = Math.max(0, k.heat - Me * .2);
        let Os = !!be.ads && !k.reload && k.sprintT < .35;
        k.adsLin = Zn(k.adsLin + (Os ? Me : -Me) / .18, 0, 1), k.adsE = Yo(k.adsLin), ve.ads = k.adsE;
        let pn = we.speed || 0,
            Ti = Fo(pn / 6),
            ho = bi(.0125, .0012, k.adsE) + Ti * bi(.013, .004, k.adsE) + k.bloom * bi(.0065, .0022, k.adsE) + (we.onGround === !1 ? .022 : 0) - (we.crouching ? .002 * (1 - k.adsE) : 0);
        k.spreadS = kn(k.spreadS, ho, 18, Me), ve.spread = k.spreadS, Oe || !!be.ads || !!k.reload || pn > .2 || be.look && Math.abs(be.look.dx) + Math.abs(be.look.dy) > .002 || k.sprintT > .1 ? (k.idleT = 0, k.inspect >= 0 && (k.inspect = Math.max(k.inspect, 2.9))) : k.idleT += Me, k.inspect < 0 && k.idleT > 24 && (k.inspect = 0);
        let Un = 0,
            zo = 0,
            $i = 0;
        if (k.inspect >= 0) {
            let Je = k.inspect += Me;
            Un = Yo(Je / .5) * (1 - Yo((Je - 1.4) / .5)), zo = Yo((Je - 1.5) / .5) * (1 - Yo((Je - 2.8) / .5)), $i = Yo(Je / .5) * (1 - Yo((Je - 2.9) / .5)), Je > 3.5 && (k.inspect = -1, k.idleT = 0)
        }
        ve.state = k.reload ? "reloading" : k.inspect >= 0 ? "inspect" : k.sprintT > .5 ? "sprinting" : k.t - k.lastShot < .14 ? "firing" : "idle", k.boltT += Me;
        let ya = .072,
            ba = k.boltT < ya ? Math.sin(Math.PI * k.boltT / ya) : 0;
        k.boltLocked && k.boltT > ya * .5 && (ba = Math.max(ba, .86)), h.position.z = mi.boltTravel * Math.max(ba * .95, nn), k.finger = kn(k.finger, Oe && bt || ce.flash ? 1 : 0, 30, Me), z(k.finger);
        let Hn = x.material.uniforms;
        if (ce.flash && (k.flashT = k.flashDur = .05, Hn.uSeed.value = 3.7), k.flashT -= Me, Hn.uInt.value = k.flashT > 0 ? 9.5 * Math.sqrt(Math.max(0, k.flashT / k.flashDur)) : 0, Hn.uHeat.value = Fo((k.heat - .45) / .8) * 2.2, x.visible = Hn.uInt.value > 0 || Hn.uHeat.value > .02, ce.freeze) return;
        let fo = we.onGround !== !1,
            ln = we.vel ? we.vel.y : 0;
        k.bobAmt = kn(k.bobAmt, fo ? Fo(pn / 3.6) : 0, 8, Me), k.bobPhase += Me * (pn > .3 && fo ? 5.2 + pn * 1.55 : 0);
        let Zo = k.bobPhase,
            yr = k.bobAmt * bi(1, .12, k.adsE) * (1 + k.sprintT * 1.4),
            lu = Math.sin(Zo) * .006 * yr,
            de = (Math.sin(2 * Zo) * .0042 - Math.pow(.5 + .5 * Math.cos(2 * Zo + .6), 4) * .0048) * yr,
            te = bi(1, .3, k.adsE),
            he = k.t,
            pe = bi(1, .4, k.adsE);
        if (k.swY.v += Zn(be.look ? be.look.dx : 0, -.2, .2) * 3.2 * pe, k.swP.v += Zn(be.look ? be.look.dy : 0, -.2, .2) * 2.6 * pe, ma(k.swY, 0, Me), ma(k.swP, 0, Me), k.swY.x = Zn(k.swY.x, -.09, .09), k.swP.x = Zn(k.swP.x, -.07, .07), k.wasGround && !fo && ln > 1 && (k.jY.v -= .22, k.jP.v += .7), !k.wasGround && fo) {
            let Je = Zn(-k.lastVy * .06, 0, .6);
            k.jY.v -= Je, k.jP.v -= Je * 3.2, k.kR.v += (ae() - .5) * Je * 2
        }
        k.wasGround = fo, fo || (k.lastVy = ln), ma(k.jY, fo ? 0 : Zn(-ln * .0045, -.02, .024), Me), ma(k.jP, fo ? 0 : Zn(ln * .012, -.06, .06), Me), ma(k.kZ, 0, Me), ma(k.kP, 0, Me), ma(k.kY, 0, Me), ma(k.kR, 0, Me), ma(k.bump, 0, Me);
        let ge = be.move ? be.move.x : 0,
            ye = be.move ? be.move.y : 0,
            Le = 1 - k.adsE,
            ke = k.adsE,
            Ue = k.sprintT,
            ct = k.reloadW,
            De = k.rackW,
            it = bi(eu.p[0], qv.p[0], ke) + tu.p[0] * Ue + nu.p[0] * ct + lu + Math.sin(he * .85 + 1) * .0012 * te - k.swY.x * .06 - ge * .004 * Le - .035 * $i,
            gt = bi(eu.p[1], qv.p[1], ke) + tu.p[1] * Ue + nu.p[1] * ct + de + Math.sin(he * 1.7) * .0016 * te + k.swP.x * .05 + k.jY.x + k.bump.x * .6 + .045 * $i,
            Ot = bi(eu.p[2], qv.p[2], ke) + tu.p[2] * Ue + nu.p[2] * ct + k.kZ.x * .55 + ye * .004 * Le * (1 - Ue),
            xn = eu.r[0] * Le + tu.r[0] * Ue + nu.r[0] * ct - .16 * De + Math.sin(he * 1.7 + .8) * .0035 * te + Math.sin(2 * Zo + .5) * .008 * yr + k.swP.x + k.jP.x + k.kP.x + k.bump.x * 1.5 + .3 * $i,
            $t = eu.r[1] * Le + tu.r[1] * Ue + nu.r[1] * ct + Math.sin(he * .6) * .002 * te + Math.sin(Zo) * .01 * yr + k.swY.x + k.kY.x + .18 * $i + .25 * zo,
            Ht = eu.r[2] * Le + tu.r[2] * Ue + nu.r[2] * ct + .62 * De + Math.sin(Zo) * .014 * yr + k.swY.x * .7 - ge * .035 * Le + k.kR.x - .75 * Un + .55 * zo + Math.sin(he * .5) * .004 * te;
        e.position.set(it, gt, Ot), e.rotation.set(xn, $t, Ht, "YXZ")
    }
    return _e(), ve
}
async function PC(i) {
    let e = await dm(i);
    i.weapon = e;
    let t = e.root,
        n = new gi(0, 1.68, 4),
        s = {
            south: [.28, -.01, 1],
            east: [1, 0, .25],
            north: [-.2, -.01, -1],
            west: [-1, 0, .1],
            nw: [-.75, -.01, -.65]
        },
        o = {
            side: [Math.PI, [1.12, 1.3, .11],
                [0, 1.235, .11], 30
            ],
            right: [0, [1.12, 1.3, -.11],
                [0, 1.235, -.11], 30
            ],
            top: [Math.PI * .86, [.62, 1.8, -.42],
                [0, 1.24, .12], 32
            ],
            hands: [Math.PI, [.4, 1.4, .02],
                [.02, 1.215, .25], 30
            ],
            rhand: [0, [.36, 1.22, .27],
                [.03, 1.16, .09], 30
            ],
            muzzle: [Math.PI, [.26, 1.37, .98],
                [0, 1.262, .44], 30
            ],
            optic: [Math.PI, [.2, 1.4, -.26],
                [0, 1.31, .02], 30
            ],
            lower: [Math.PI, [.34, 1.26, .04],
                [0, 1.2, .03], 30
            ]
        },
        r = window.__setShot,
        a = null;

    function l(u, h = {}) {
        a = u;
        let f = o[u],
            p = i.input,
            d = i.player;
        p.ads = !1, p.fire = !1, d.sprinting = !1, d.speed = 0, e.debug.reloadT = null, e.debug.flash = !1, e.debug.empty = !1, e.debug.freeze = !!f, e.reset();
        let v, g, x;
        if (f) i.scene.add(t), t.position.set(0, 1.25, 0), t.rotation.set(0, f[0], 0, "YXZ"), t.traverse(y => y.layers.set(vf)), v = f[1], g = f[2], x = f[3], h.wt != null && (e.debug.reloadT = +h.wt, e.debug.empty = !!h.wempty);
        else {
            i.camera.add(t), t.traverse(b => b.layers.set(zc));
            let y = s[h.wlook] || s.south;
            v = [n.x, n.y, n.z], g = [n.x + y[0] * 50, n.y + y[1] * 50, n.z + y[2] * 50], x = 74, u === "ads" && (p.ads = !0, x = 52), u === "sprint" && (d.sprinting = !0, d.speed = 6), u === "fire" && (e.debug.flash = !0, h.wads && (p.ads = !0, x = 52)), (u === "reload" || u === "empty") && (e.debug.reloadT = h.wt != null ? +h.wt : .62, e.debug.empty = u === "empty"), u === "empty" && (e.ammo = 0)
        }
        return e.snap(), e.update(.016), e.snap(), r && r({
            cam: h.cam || [...v, ...g].join(","),
            fov: h.fov || x,
            exposure: h.exposure
        }), {
            cam: v,
            target: g
        }
    }
    window.__setShot = u => {
        u && u.wpose ? l(u.wpose, u) : r && r(u)
    };
    let c = l(i.params.wpose || "hip", i.params);
    return {
        cam: c.cam,
        target: c.target,
        update(u) {
            e.update(u), a === "fire" && (e.debug.flash = !0)
        }
    }
}
/* ============================================================ 武器系统 v2 —— 类型注册表 DGTypes（契约 notes/weapons-v2-spec.md §1）
   五种武器：pac9（dm 程序化）/ deagle / awp / mp5 / uzi（后四者 dgGlb 加载）
   字段：名称/弹匣/备弹(-1=∞)/RPM/扛法(hold:auto|semi|bolt)/伤害/射程/adsFov/
         换弹(战术/空仓)/散布 bloom 与恢复/基础-开镜散布/后坐系数/每发热量/
         位姿表(hip/ads/reload × P/R)/scaleLen/模型路径/音效名
   注：换弹相位(magout/magin/tap/bolt)按 deagle 现值对总时长的比例在 dgBuild 内推导
       （.256/.674/.753 × reloadT、.86 × reloadE，还原 deagle .55/1.45/1.62/2.45）；
       散布/后坐未列出的类型项为按 spec §1 基线拟合的估计值（见报告"与 spec 出入"）。 */
var DGTypes = {
        pac9: {
            kind: "pac9",
            name: "几猫九式突击步枪",
            mag: 30,
            reserve: 120,
            cat: "long",
            rpm: 720,
            hold: "auto",
            damage: 26,
            range: 300,
            adsFov: 52,
            reloadT: 2.1,
            reloadE: 2.72,
            bloom: .17,
            bloomDecay: 1.5,
            base: .0125,
            adsB: .0012,
            rc: 1,
            heat: .05,
            hipP: eu.p,
            hipR: eu.r,
            adsP: qv.p,
            adsR: qv.r,
            reloadP: tu.p,
            reloadR: tu.r,
            scaleLen: 0,
            model: null,
            sfx: {
                shot: "rifle_shot"
            }
        },
        deagle: {
            kind: "deagle",
            name: "沙漠之鹰",
            mag: 7,
            reserve: 28,
            cat: "pistol",
            rpm: 210,
            hold: "semi",
            damage: 55,
            range: 120,
            adsFov: 52,
            reloadT: 2.15,
            reloadE: 2.85,
            bloom: .28,
            bloomDecay: 1.2,
            base: .016,
            adsB: .0012,
            rc: 1,
            heat: .09,
            hipP: [.135, -.158, -.3],
            hipR: [.03, .06, -.02],
            adsP: [0, -.104, -.2],
            adsR: [0, 0, 0],
            reloadP: [0, -.09, .05],
            reloadR: [-.55, .12, -.18],
            scaleLen: .3,
            model: "assets/models/desert-eagle.glb",
            sfx: {
                shot: "pistol_shot",
                dry: "pistol_dry"
            }
        },
        awp: {
            kind: "awp",
            name: "AWP 狙击步枪",
            mag: 10,
            reserve: 40,
            cat: "long",
            rpm: 45,
            hold: "bolt",
            damage: 110,
            range: 600,
            adsFov: 18,
            reloadT: 2.6,
            reloadE: 3.2,
            bloom: .34,
            bloomDecay: 2.6,
            base: .0005,
            adsB: .0001,
            rc: 1.5,
            heat: .12,
            hipP: [.14, -.16, -.4],
            hipR: [.03, .07, -.02],
            adsP: [0, -.115, -.32],
            adsR: [0, 0, 0],
            reloadP: [0, -.09, .06],
            reloadR: [-.5, .1, -.15],
            scaleLen: .55,
            model: "assets/models/awp.glb",
            sfx: {
                shot: "awp_shot",
                bolt: "awp_bolt"
            }
        },
        mp5: {
            kind: "mp5",
            name: "MP5 冲锋枪",
            mag: 30,
            reserve: 120,
            cat: "long",
            rpm: 800,
            hold: "auto",
            damage: 22,
            range: 180,
            adsFov: 52,
            reloadT: 2,
            reloadE: 2.5,
            bloom: .12,
            bloomDecay: 1.6,
            base: .014,
            adsB: .0015,
            rc: .6,
            heat: .05,
            hipP: [.13, -.15, -.3],
            hipR: [.03, .06, -.02],
            adsP: [0, -.104, -.24],
            adsR: [0, 0, 0],
            reloadP: [0, -.09, .05],
            reloadR: [-.55, .12, -.18],
            scaleLen: .36,
            model: "assets/models/mp5.glb",
            sfx: {
                shot: "mp5_shot",
                reload: "mp5_reload"
            }
        },
        uzi: {
            kind: "uzi",
            name: "Uzi 冲锋枪",
            mag: 25,
            reserve: 100,
            cat: "long",
            rpm: 950,
            hold: "auto",
            damage: 17,
            range: 120,
            adsFov: 52,
            reloadT: 1.9,
            reloadE: 2.4,
            bloom: .2,
            bloomDecay: 1.4,
            base: .022,
            adsB: .004,
            rc: .5,
            heat: .04,
            hipP: [.12, -.15, -.26],
            hipR: [.03, .06, -.02],
            adsP: [0, -.1, -.2],
            adsR: [0, 0, 0],
            reloadP: [0, -.09, .05],
            reloadR: [-.55, .12, -.18],
            scaleLen: .22,
            model: "assets/models/uzi.glb",
            sfx: {
                shot: "uzi_shot",
                reload: "uzi_reload"
            }
        }
    },
    dgLerp = (i, e, t) => i + (e - i) * t,
    dgClamp = (i, e, t) => i < e ? e : i > t ? t : i,
    dgModels = {},
    dgGundataCount = 0,
    /* 集装箱刷枪上限：47 点全放会常驻 47 模型+47 光柱，取最底层点中随机 ≤12 个 */
    dgContainerMax = 12,
    /* v3（spec §2）：GUNDATA 全量并入注册表（kind=slug）。
       同名冲突以既有 5 款为准；缺字段按 cat 兜底（long→槽1 / pistol→槽2）。
       08b-gundata.js 由构建插在本文件之前，运行时是全局 var；node --check 阶段不存在也安全（typeof 探测）。 */
    dgMergeGundata = () => {
        let src = typeof GUNDATA == "object" && Array.isArray(GUNDATA) ? GUNDATA : [];
        for (let g of src) {
            if (!g || !g.slug || DGTypes[g.slug]) continue;
            let cat = g.cat === "pistol" ? "pistol" : "long";
            DGTypes[g.slug] = {
                kind: g.slug,
                name: g.name || g.slug,
                mag: Math.max(1, g.mag | 0 || 30),
                reserve: Math.max(4, (g.mag | 0 || 30) * 4),
                cat: cat,
                rpm: Math.max(30, g.rpm | 0 || 600),
                hold: g.fire === "semi" || g.fire === "bolt" ? g.fire : "auto",
                damage: Math.max(1, +g.damage || 25),
                range: Math.max(30, +g.range || 200),
                adsFov: Math.max(12, Math.min(70, +g.adsFov || 52)),
                reloadT: Math.max(.8, +g.reloadT || 2.1),
                reloadE: Math.max(1, +g.reloadE || (Math.max(.8, +g.reloadT || 2.1)) * 1.3),
                bloom: +g.bloom >= 0 ? +g.bloom : .15,
                rc: +g.rc > 0 ? +g.rc : 1,
                bloomDecay: 1.5,
                base: cat === "pistol" ? .016 : .013,
                adsB: cat === "pistol" ? .0012 : .0015,
                heat: cat === "pistol" ? .09 : .05,
                hipP: cat === "pistol" ? [.135, -.158, -.3] : [.13, -.15, -.32],
                hipR: [.03, .06, -.02],
                adsP: cat === "pistol" ? [0, -.104, -.2] : [0, -.108, -.26],
                adsR: [0, 0, 0],
                reloadP: [0, -.09, .05],
                reloadR: [-.55, .12, -.18],
                scaleLen: Math.max(.18, Math.min(.6, +g.scaleLen || (cat === "pistol" ? .28 : .4))),
                model: g.model || "assets/models/v3/" + g.slug + ".glb",
                sfx: null,
                __dgData: !0
            };
            dgGundataCount++
        }
        return Object.keys(DGTypes).length
    },
    dgTypeCount = dgMergeGundata();
/* v3（spec §2）：SOUNDDATA 查表（shot/reload/bolt/dry 数组，多文件=变体），缺项走 fallback 按 cat+fire 回退。
   注册进 Go 的条目用「打开时取通道」的 gen：首次播放才真正 fetch+decode（懒加载），失败静默降级合成音。 */
function dgSfxPlan(slug) {
    let T = DGTypes[slug];
    if (!T) return null;
    let sd = typeof SOUNDDATA == "object" && SOUNDDATA ? SOUNDDATA : null,
        entry = sd && sd[slug] || null,
        fb = sd && sd.fallback || null,
        pick = arr => Array.isArray(arr) && arr.length ? arr.slice() : null,
        catShot = fb ? (cat => cat === "pistol" ? pick(fb.pistol_shot) : (T.hold === "bolt" ? pick(fb.sniper_shot) : pick(fb.smg_shot) || pick(fb.long_shot)))(T.cat) : null;
    return {
        shot: entry && pick(entry.shot) || catShot || null,
        reload: entry && pick(entry.reload) || (fb && pick(fb.reload)) || null,
        bolt: entry && pick(entry.bolt) || (fb && pick(fb.bolt)) || null,
        dry: entry && pick(entry.dry) || (fb && pick(fb.pistol_shot)) || null
    }
}
function dgRegisterGo(slug, name, files, synthKind, ctx) {
    if (!ctx || typeof Go != "object" || Go[name]) return;
    let chans = [],
        started = !1,
        failed = !1,
        gen = (sr, seed, variant) => {
            /* 懒加载：注册时不 fetch，首次 gen 调用（即首播）才拉文件解码；
               多文件 = 变体，按 seed 选一个拉；到位前/失败时回合成音（dgSynth），静默降级。 */
            if (!started && !failed) {
                started = !0;
                let one = files[Math.abs(seed | 0) % files.length];
                fetch(one).then(r => {
                    if (!r.ok) throw new Error("http " + r.status);
                    return r.arrayBuffer()
                }).then(buf => ctx.decodeAudioData(buf)).then(dec => {
                    chans.push(dec.getChannelData(0).slice())
                }).catch(() => {
                    failed = !0
                })
            }
            return chans.length ? chans[variant % chans.length] : dgSynth(sr, synthKind)
        };
    Go[name] = {
        gen: gen,
        n: 1,
        sr: ctx.sampleRate,
        peak: .97,
        bus: "near",
        max: 5,
        pri: 9
    }
}
function dgAudioV3(i) {
    let e = i.audio && i.audio.ctx;
    if (!e || typeof Go != "object") return;
    for (let slug in DGTypes) {
        /* 既有 5 款走 v2 音频链（dgAudio 的 pistol_* 合成注册 + 扩展名容错 + rifle_shot 内置合成），不覆盖 */
        if (!DGTypes[slug].__dgData) continue;
        let plan = dgSfxPlan(slug);
        if (!plan) continue;
        plan.shot && dgRegisterGo(slug, slug + "_shot", plan.shot, "shot", e);
        plan.reload && dgRegisterGo(slug, slug + "_reload", plan.reload, "click", e);
        plan.bolt && dgRegisterGo(slug, slug + "_bolt", plan.bolt, "click", e);
        plan.dry && dgRegisterGo(slug, slug + "_dry", plan.dry, "click", e)
    }
}

function dgSmooth(i, e, t, n) {
    return i + (e - i) * (1 - Math.exp(-t * n))
}
async function dgGlb(i, dgLen = .3) {
    let e = await (await fetch(i)).arrayBuffer(),
        t = new DataView(e);
    if (t.getUint32(0, !0) !== 0x46546c67) throw new Error("[dg] not a glb file: " + i);
    let n = 12,
        s = null,
        o = null;
    for (; n < e.byteLength;) {
        let u = t.getUint32(n, !0),
            h = t.getUint32(n + 4, !0);
        h === 0x4e4f534a ? s = JSON.parse(new TextDecoder().decode(new Uint8Array(e, n + 8, u))) : h === 0x004e4942 && (o = e.slice(n + 8, n + 8 + u)), n += 8 + u
    }
    let r = new DataView(o),
        a = {
            5120: 1,
            5121: 1,
            5122: 2,
            5123: 2,
            5125: 4,
            5126: 4
        },
        l = {
            SCALAR: 1,
            VEC2: 2,
            VEC3: 3,
            VEC4: 4,
            MAT4: 16
        };

    function c(u, h) {
        let f = s.accessors[u],
            p = s.bufferViews[f.bufferView],
            d = a[f.componentType],
            v = l[f.type],
            g = p.byteStride || d * v,
            y = (p.byteOffset || 0) + (f.byteOffset || 0),
            b = h ? new Uint32Array(f.count) : new Float32Array(f.count * v);
        for (let m = 0; m < f.count; m++)
            for (let A = 0; A < v; A++) {
                let _ = y + m * g + A * d,
                    S;
                switch (f.componentType) {
                    case 5126:
                        S = r.getFloat32(_, !0);
                        break;
                    case 5125:
                        S = r.getUint32(_, !0);
                        break;
                    case 5123:
                        S = r.getUint16(_, !0);
                        break;
                    case 5121:
                        S = r.getUint8(_);
                        break;
                    case 5122:
                        S = r.getInt16(_, !0);
                        break;
                    default:
                        S = r.getInt8(_)
                }
                h ? b[m] = S : b[m * v + A] = S
            }
        return b
    }
    let u = [];
    for (let f of s.images || []) {
        if (f.bufferView != null) try {
            let p = s.bufferViews[f.bufferView],
                d = new Uint8Array(o, p.byteOffset || 0, p.byteLength),
                v = await createImageBitmap(new Blob([d], {
                    type: f.mimeType || "image/png"
                })),
                g = document.createElement("canvas");
            g.width = v.width, g.height = v.height, g.getContext("2d").drawImage(v, 0, 0);
            let y = new lt.CanvasTexture(g);
            y.colorSpace = "srgb", u.push(y)
        } catch {
            u.push(null)
        } else u.push(null)
    }
    let h = (s.materials || []).map(f => {
        let p = f.pbrMetallicRoughness || {},
            d = p.baseColorFactor || [1, 1, 1, 1],
            v = (d[0] + d[1] + d[2]) / 3 > .42,
            g = new lt.MeshStandardMaterial({
                color: v ? 0x3c434b : 0x191c21,
                metalness: v ? .88 : .55,
                roughness: v ? .38 : .62
            });
        return p.baseColorTexture && u[p.baseColorTexture.index] && (g.map = u[p.baseColorTexture.index], g.color.set(0xffffff)), g
    });
    h.length || h.push(new lt.MeshStandardMaterial({
        color: 0x2c3238,
        metalness: .8,
        roughness: .45
    }));
    let f = new lt.Group,
        p = [],
        d = new lt.Matrix4,
        bp = [];

    function v(y, b, B) {
        let m = s.nodes[y],
            A = new lt.Matrix4();
        if (m.matrix) A.fromArray(m.matrix);
        else {
            let S = m.translation || [0, 0, 0],
                T = m.rotation || [0, 0, 0, 1],
                w = m.scale || [1, 1, 1];
            A.compose(new lt.Vector3(S[0], S[1], S[2]), new lt.Quaternion(T[0], T[1], T[2], T[3]), new lt.Vector3(w[0], w[1], w[2]))
        }
        if (A.premultiply(b), m.name && p.push(m.name), !B && m.name && /barrel/i.test(m.name) && (B = !0), m.mesh != null)
            for (let S of s.meshes[m.mesh].primitives) {
                let T = new lt.BufferGeometry;
                T.setAttribute("position", new lt.Float32BufferAttribute(c(S.attributes.POSITION), 3)), S.attributes.NORMAL != null && T.setAttribute("normal", new lt.Float32BufferAttribute(c(S.attributes.NORMAL), 3)), S.attributes.TEXCOORD_0 != null && T.setAttribute("uv", new lt.Float32BufferAttribute(c(S.attributes.TEXCOORD_0), 2)), S.indices != null && T.setIndex(new lt.BufferAttribute(c(S.indices, !0), 1)), T.applyMatrix4(A), S.attributes.NORMAL == null && T.computeVertexNormals();
                let w = new lt.Mesh(T, h[S.material != null ? S.material : 0] || h[0]);
                w.castShadow = w.receiveShadow = !1, f.add(w), B && bp.push(w)
            }
        for (let S of m.children || []) v(S, A, B)
    }
    let g = s.scenes && s.scenes.length ? s.scenes[s.scene || 0].nodes || [] : (s.nodes || []).map((y, b) => b);
    for (let y of g) v(y, d.clone(), !1);
    let y = new lt.Box3().setFromObject(f),
        b = y.getSize(new lt.Vector3),
        m = y.getCenter(new lt.Vector3),
        A = new lt.Matrix4;
    b.x > b.z && A.makeRotationY(Math.PI / 2);
    if (bp.length) {
        let bq = new lt.Box3;
        for (let w of bp) bq.expandByObject(w);
        bq.getCenter(new lt.Vector3).applyMatrix4(A).z > 0 && A.multiply(new lt.Matrix4().makeRotationY(Math.PI))
    }
    let S = dgLen / Math.max(b.x, b.y, b.z),
        T = new lt.Matrix4().makeScale(S, S, S).multiply(A).multiply(new lt.Matrix4().makeTranslation(-m.x, -m.y, -m.z));
    f.traverse(w => {
        w.isMesh && w.geometry.applyMatrix4(T)
    });
    let w = new lt.Box3().setFromObject(f),
        x = w.getSize(new lt.Vector3),
        k = {
            muzzle: [0, w.max.y * .55, w.min.z * .98],
            eject: [w.max.x * .85, w.max.y * .35, 0],
            names: p,
            size: [x.x, x.y, x.z]
        };
    if (bp.length) {
        let b2 = new lt.Box3;
        for (let w2 of bp) b2.expandByObject(w2);
        k.barrelZ = +b2.getCenter(new lt.Vector3).z.toFixed(3)
    }
    return {
        root: f,
        info: k
    }
}

function dgAudio(i) {
    let e = i.audio && i.audio.ctx;
    if (!e || typeof Go != "object") return;
    let t = {
        pistol_shot: ["assets/audio/oga-22magnum.wav", "assets/audio/oga-22pistol.wav"],
        pistol_dry: ["assets/audio/oga-reload-click.mp3"],
        pistol_magout: ["assets/audio/gun_reload.1.ogg"],
        pistol_magin: ["assets/audio/gun_reload.2.ogg"],
        pistol_bolt: ["assets/audio/oga-reload-click.mp3"],
        pistol_click: ["assets/audio/oga-reload-click.mp3"]
    };
    for (let n in t) ! function(s) {
        let o = t[s],
            r = [];
        Promise.all(o.map(a => fetch(a).then(l => l.arrayBuffer()).then(l => e.decodeAudioData(l)))).then(a => {
            for (let l of a) r.push(l.getChannelData(0).slice());
            Go[s] = {
                gen: (l, c, u) => r[u % r.length],
                n: r.length,
                sr: e.sampleRate,
                peak: .97,
                bus: "near",
                max: 5,
                pri: 9
            }
        }).catch(a => console.warn("[dg] audio load failed: " + s, a))
    }(n);
    /* 武器 v2 外置音效（spec §6）：扩展名容错依次试 wav/mp3/ogg；
       全部失败 → 静默降级为合成音（不抛错、不刷屏），页面内已注册即可被 i.audio.play 命中 */
    let u = {
        awp_shot: "shot",
        awp_bolt: "click",
        mp5_shot: "shot",
        mp5_reload: "reload",
        uzi_shot: "shot",
        uzi_reload: "reload"
    };
    for (let n in u) ! function(s, g) {
        let o = [".wav", ".mp3", ".ogg"].map(a => "assets/audio/" + s + a);
        (async () => {
            for (let p of o) try {
                let l = await fetch(p);
                if (!l.ok) continue;
                let c = await e.decodeAudioData(await l.arrayBuffer()),
                    d = [c.getChannelData(0).slice()];
                Go[s] = {
                    gen: (a, b, h) => d[h % d.length],
                    n: d.length,
                    sr: e.sampleRate,
                    peak: .97,
                    bus: "near",
                    max: 5,
                    pri: 9
                };
                return
            } catch (a) {}
            Go[s] = {
                gen: a => dgSynth(a, g),
                n: 1,
                sr: e.sampleRate,
                peak: .97,
                bus: "near",
                max: 5,
                pri: 9
            }
        })()
    }(n, u[n])
}

function dgSynth(i, e) {
    let t = Math.max(16, (e === "shot" ? .18 : .07) * i | 0),
        n = new Float32Array(t);
    for (let s = 0; s < t; s++) {
        let o = s / t,
            r = Math.pow(1 - o, e === "shot" ? 3 : 6);
        n[s] = (Math.random() * 2 - 1) * r, e === "shot" && (n[s] += Math.sin(s / i * 596.9) * Math.pow(1 - o, 4) * .5)
    }
    return n
}

/* 模型缺失/损坏时的占位回退（spec §5.4）：细长盒体拼枪形，枪口朝 -z，info 形状与 dgGlb 一致 */
function dgPlaceholder(i) {
    let e = i.scaleLen || .3,
        t = new lt.Group;
    t.name = "viewmodel-" + i.kind + "-placeholder";
    let n = new lt.MeshStandardMaterial({
            color: 2896440,
            metalness: .8,
            roughness: .45
        }),
        s = (o, r, a, l, c, u) => {
            let h = new lt.Mesh(new lt.BoxGeometry(o, r, a), n);
            h.position.set(l, c, u), h.castShadow = h.receiveShadow = !1, t.add(h)
        };
    return s(e * .5, e * .16, e * .14, 0, 0, 0), s(e * .06, e * .06, e * .5, 0, e * .02, -e * .4), s(e * .09, e * .2, e * .1, 0, -e * .16, e * .1), s(e * .08, e * .2, e * .12, 0, -e * .16, -e * .02), s(e * .1, e * .1, e * .2, 0, 0, e * .3), {
        root: t,
        info: {
            muzzle: [0, e * .03, -e * .66],
            eject: [e * .1, e * .04, e * .05],
            names: ["placeholder:" + i.kind],
            size: [e * .5, e * .4, e * 1.1]
        }
    }
}

/* v3：占位几何的资源回收（替换正式模型后清理 GPU 侧 buffer，防 64 枪懒加载堆积显存） */
function dgDispose(root) {
    let mats = new Set,
        geos = new Set;
    root.traverse(o => {
        o.isMesh && (o.geometry && geos.add(o.geometry), o.material && (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)))
    });
    for (let g of geos) g.dispose && g.dispose();
    for (let m of mats) m.dispose && m.dispose()
}

/* 泛化视模工厂（spec §1/§5.3）：按 DGTypes[kind] 构建——deagle 与原实现数值逐一等价（手感保持），
   awp/mp5/uzi 走 dgGlb 加载（失败回退占位）；扛法 auto 连发循环 / semi·bolt 边沿 + 冷却，
   bolt（awp）在 emit 后延时播 sfx.bolt（60/45≈1.33s 冷却由 rpm 天然给出） */
/* 同步视模装配核心：拿 t（{root,info}，GLB 或占位）、建枪口火光/动画状态/实例门面。
   v3 懒加载的关键——先用占位盒体同步建出「接口完全一致」的实例，模型后台到位后 dgSwapModel 原位替换几何。 */
function dgAssemble(i, kind, T, t) {
    let e = new lt.Group;
    e.name = "viewmodel-" + kind;
    e.add(t.root);
    let n = t.info,
        s = document.createElement("canvas");
    s.width = s.height = 64;
    let o = s.getContext("2d"),
        r = o.createRadialGradient(32, 32, 2, 32, 32, 30);
    r.addColorStop(0, "rgba(255,240,190,1)"), r.addColorStop(.35, "rgba(255,170,60,.75)"), r.addColorStop(1, "rgba(255,120,20,0)"), o.fillStyle = r, o.fillRect(0, 0, 64, 64);
    let fz = (T.scaleLen || .3) / .3,
        a = new lt.Mesh(new lt.PlaneGeometry(.22 * fz, .22 * fz), new lt.MeshBasicMaterial({
            map: new lt.CanvasTexture(s),
            blending: lt.AdditiveBlending,
            depthWrite: !1,
            transparent: !0
        }));
    a.name = "dg-flash", a.position.set(n.muzzle[0], n.muzzle[1], n.muzzle[2]), a.renderOrder = 10, a.visible = !1, e.add(a), e.traverse(l => {
        l.layers && l.layers.set(zc)
    }), i.camera.add(e), e.visible = !1;
    /* 换弹相位按 deagle 实测比例从总时长推导（.2558/.6744/.7535×reloadT、.8596×reloadE ≈ .55/1.45/1.62/2.45） */
    let PH = {
            mgO: .2558 * T.reloadT,
            mgI: .6744 * T.reloadT,
            tp: .7535 * T.reloadT,
            bk: .8596 * T.reloadE
        },
        l = {
            t: 0,
            cooldown: 0,
            prevFire: !1,
            dryDone: !1,
            autoReload: -1,
            reload: null,
            burst: 0,
            lastShot: -9,
            bloom: 0,
            heat: 0,
            adsLin: 0,
            adsE: 0,
            sprintT: 0,
            spreadS: T.base,
            reloadW: 0,
            rackW: 0,
            boltT: 9,
            boltLocked: !1,
            flashT: 0,
            flashDur: .05,
            flashS: .16 * fz,
            bobAmt: 0,
            bobPhase: 0,
            wasGround: !0,
            lastVy: 0,
            kZ: pa(520, 30),
            kP: pa(380, 26),
            kY: pa(300, 22),
            kR: pa(300, 20),
            swY: pa(110, 15),
            swP: pa(110, 15),
            jY: pa(140, 13),
            jP: pa(140, 13),
            bump: pa(600, 30)
        },
        c = {
            noFire: !1
        },
        u = new lt.Vector3,
        h = new lt.Vector3,
        f = new lt.Vector3,
        p = new lt.Vector3,
        d = new lt.Vector3,
        v = new lt.Vector3;

    function g() {
        e.updateMatrix(), p.fromArray(n.muzzle).applyMatrix4(e.matrix);
        let C = i.camera,
            D = Math.tan(C.fov * Math.PI / 360) / Math.tan(i.viewCamera.fov * Math.PI / 360);
        return p.x *= D, p.y *= D, p.applyQuaternion(C.quaternion).add(C.position)
    }

    function y(C = new lt.Vector3) {
        return C.copy(g())
    }

    function b() {
        if (l.reload || w.ammo >= w.magSize || w.reserve <= 0) return !1;
        let C = w.ammo <= 0;
        return l.reload = {
            t: 0,
            T: C ? T.reloadE : T.reloadT,
            empty: C,
            f: {}
        }, l.autoReload = -1, i.events.emit("weapon:reload", {
            phase: "start",
            empty: C,
            w: kind
        }), !0
    }

    function dy() {
        l.dryDone || (l.dryDone = !0, i.events.emit("weapon:dry", {
            w: kind
        }), l.bump.v -= .08, w.reserve > 0 && (l.autoReload = .32))
    }

    function m() {
        let C = i.player,
            D = i.camera;
        w.ammo--, l.burst++, l.lastShot = l.t, l.heat = Math.min(1.3, l.heat + T.heat);
        let E = w.spread,
            F = Math.random() * Math.PI * 2,
            G = Math.tan(E) * Math.sqrt(Math.random());
        u.set(Math.cos(F) * G, Math.sin(F) * G, -1).normalize().applyQuaternion(D.quaternion), h.copy(C.eye || D.position);
        let H = null;
        try {
            H = i.combat.playerShot(h, u, {
                damage: T.damage,
                range: T.range
            })
        } catch {}
        H && H.point ? f.copy(H.point) : f.copy(h).addScaledVector(u, T.range), g();
        let I = i.fx;
        I && (I.tracer && I.tracer(p, f), I.shell && (e.updateMatrix(), d.fromArray(n.eject).applyMatrix4(e.matrix), v.set(2 + Math.random() * 1.2, 1.2 + Math.random() * .8, .5 - Math.random() * .6).applyQuaternion(D.quaternion), C.vel && v.add(C.vel), I.shell(d, v))), i.render && i.render.lightPool && i.render.lightPool.flash(p, 16756832, 60, 8, .06), i.events.emit("weapon:fire", {
            origin: h,
            dir: u,
            muzzle: p,
            ads: l.adsE,
            w: kind
        });
        let J = dgLerp(1, .55, l.adsE) * (C.crouching ? .85 : 1);
        C.addRecoil && C.addRecoil(.0155 * T.rc * J * (.85 + Math.random() * .3), (Math.random() - .5) * .0032 * T.rc * J), C.addShake && C.addShake(.2 * T.rc * J), l.kZ.v += 2.6 * T.rc * dgLerp(1, .6, l.adsE), l.kP.v += 2.8 * T.rc * J, l.kY.v += (Math.random() - .5) * 1.4 * T.rc * J, l.kR.v += (Math.random() - .5) * 2.6 * T.rc * J, l.bloom = Math.min(1, l.bloom + T.bloom), l.flashT = l.flashDur = .045 + Math.random() * .02, l.flashS = (.16 + Math.random() * .07) * fz, l.boltT = 0, w.ammo <= 0 && (l.boltLocked = !0)
    }

    function A(C) {
        let D = i.player,
            E = i.input;
        if (!D || !E || !D.alive) {
            l.prevFire = !1, a.visible = !1;
            return
        }
        l.t += C;
        let F = !!E.fire && e.visible && !c.noFire,
            G = F && !l.prevFire;
        l.prevFire = F, F || (l.dryDone = !1);
        let H = !!D.sprinting && !F && !E.ads && !l.reload;
        l.sprintT = dgSmooth(l.sprintT, H ? 1 : 0, 9, C), E.pressed && E.pressed("reload") && b(), l.autoReload >= 0 && (l.autoReload -= C, l.autoReload < 0 && b());
        if (l.reload) {
            let M = l.reload;
            M.t += C;
            let N = M.t,
                O = (P, Q) => N >= Q && !M.f[P] ? (M.f[P] = 1, i.events.emit("weapon:reload", {
                    phase: P,
                    empty: M.empty,
                    w: kind
                }), !0) : !1;
            if (O("magout", PH.mgO) && (l.bump.v -= .25), O("magin", PH.mgI)) {
                l.bump.v += .5;
                let P = Math.min(w.magSize - w.ammo, w.reserve);
                w.ammo += P, w.reserve -= P, M.empty || (l.boltLocked = !1)
            }
            O("tap", PH.tp) && (l.bump.v += .35), M.empty && O("bolt", PH.bk) && (l.boltLocked = !1, l.bump.v += .3, l.kZ.v -= .5);
            let R = Yo(N / .3),
                S = 1 - Yo((N - (M.T - .5)) / .45);
            l.reloadW = Math.min(R, S), l.rackW = M.empty ? Yo((N - (PH.bk - .55)) / .35) * S : 0, N >= M.T && (l.reload = null, l.reloadW = 0, l.rackW = 0, i.events.emit("weapon:reload", {
                phase: "done",
                w: kind
            }))
        }
        l.cooldown -= C;
        let J = !l.reload && l.sprintT < .45;
        if (F && J) {
            if (T.hold === "auto") {
                if (w.ammo > 0) {
                    let M = 0;
                    for (; l.cooldown <= 0 && w.ammo > 0 && M < 3;) m(), l.cooldown += 60 / T.rpm, M++
                } else dy()
            } else if (G && l.cooldown <= 0) {
                if (w.ammo > 0) {
                    if (m(), l.cooldown = 60 / T.rpm, T.hold === "bolt" && i.audio && i.audio.play) i.audio.play(kind + "_bolt", {
                        gain: .85,
                        delay: .35,
                        jitter: .06
                    })
                } else dy()
            }
        }
        l.cooldown < 0 && (l.cooldown = Math.max(l.cooldown, -.001)), l.bloom = Math.max(0, l.bloom - C * T.bloomDecay);
        let K = !!E.ads && !l.reload && l.sprintT < .35;
        l.adsLin = dgClamp(l.adsLin + (K ? C : -C) / .16, 0, 1), l.adsE = Yo(l.adsLin), w.ads = l.adsE;
        let L = D.speed || 0,
            U = dgClamp(L / 6, 0, 1),
            V = dgLerp(T.base, T.adsB, l.adsE) + U * dgLerp(.013, .004, l.adsE) + l.bloom * dgLerp(.011, .003, l.adsE) + (D.onGround === !1 ? .022 : 0) - (D.crouching ? .002 * (1 - l.adsE) : 0);
        l.spreadS = dgSmooth(l.spreadS, V, 18, C), w.spread = l.spreadS, w.state = l.reload ? "reloading" : l.sprintT > .5 ? "sprinting" : l.t - l.lastShot < .18 ? "firing" : "idle", l.flashT > 0 ? (l.flashT -= C, a.visible = !0, a.scale.setScalar(l.flashS * (.4 + .6 * Math.max(0, l.flashT / l.flashDur))), a.rotation.z = Math.random() * 6.28) : a.visible = !1;
        let W = D.onGround !== !1,
            X = D.vel ? D.vel.y : 0;
        l.bobAmt = dgSmooth(l.bobAmt, W ? dgClamp(L / 3.6, 0, 1) : 0, 8, C), l.bobPhase += C * (L > .3 && W ? 5 + L * 1.5 : 0);
        let Y = l.bobAmt * dgLerp(1, .12, l.adsE),
            Z = Math.sin(l.bobPhase) * .006 * Y,
            $ = (Math.sin(2 * l.bobPhase) * .0042 - Math.pow(.5 + .5 * Math.cos(2 * l.bobPhase + .6), 4) * .0048) * Y,
            _ = dgLerp(1, .4, l.adsE);
        if (l.swY.v += dgClamp(E.look ? E.look.dx : 0, -.2, .2) * 3 * _, l.swP.v += dgClamp(E.look ? E.look.dy : 0, -.2, .2) * 2.4 * _, ma(l.swY, 0, C), ma(l.swP, 0, C), l.swY.x = dgClamp(l.swY.x, -.09, .09), l.swP.x = dgClamp(l.swP.x, -.07, .07), l.wasGround && !W && X > 1 && (l.jY.v -= .2, l.jP.v += .6), !l.wasGround && W) {
            let M = dgClamp(-l.lastVy * .05, 0, .6);
            l.jY.v -= M, l.jP.v -= M * 3.2, l.kR.v += (Math.random() - .5) * M * 2
        }
        l.wasGround = W, W || (l.lastVy = X), ma(l.jY, 0, C), ma(l.jP, 0, C), ma(l.kZ, 0, C), ma(l.kP, 0, C), ma(l.kY, 0, C), ma(l.kR, 0, C), ma(l.bump, 0, C);
        let ab = E.move ? E.move.x : 0,
            bb = E.move ? E.move.y : 0,
            cb = l.adsE,
            db = l.sprintT,
            eb = l.reloadW,
            fb = l.rackW,
            gb = dgLerp(T.hipP[0], T.adsP[0], cb) + T.reloadP[0] * eb + Z - l.swY.x * .06 - ab * .004 * (1 - cb),
            hb = dgLerp(T.hipP[1], T.adsP[1], cb) + T.reloadP[1] * eb + $ + l.swP.x * .05 + l.jY.x + l.bump.x * .6,
            ib = dgLerp(T.hipP[2], T.adsP[2], cb) + T.reloadP[2] * eb + l.kZ.x * .55 + bb * .004 * (1 - cb) * (1 - db),
            jb = T.hipR[0] * (1 - cb) + T.adsR[0] * cb + T.reloadR[0] * eb - .16 * fb + l.swP.x + l.jP.x + l.kP.x + l.bump.x * 1.5,
            kb = T.hipR[1] * (1 - cb) + T.adsR[1] * cb + T.reloadR[1] * eb + l.swY.x + l.kY.x,
            lb = T.hipR[2] * (1 - cb) + T.adsR[2] * cb + T.reloadR[2] * eb + .62 * fb + l.swY.x * .7 - ab * .035 * (1 - cb) + l.kR.x;
        e.position.set(gb, hb, ib), e.rotation.set(jb, kb, lb, "YXZ")
    }

    function _() {
        w.ammo = T.mag, w.reserve = T.reserve, w.state = "idle", w.ads = 0, w.spread = T.base, Object.assign(l, {
            t: 0,
            cooldown: 0,
            prevFire: !1,
            dryDone: !1,
            autoReload: -1,
            reload: null,
            burst: 0,
            lastShot: -9,
            bloom: 0,
            heat: 0,
            adsLin: 0,
            adsE: 0,
            sprintT: 0,
            reloadW: 0,
            rackW: 0,
            boltT: 9,
            boltLocked: !1,
            flashT: 0,
            bobAmt: 0,
            bobPhase: 0,
            wasGround: !0,
            lastVy: 0
        });
        for (let C of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) l[C].x = 0, l[C].v = 0;
        a.visible = !1
    }
    let w = {
        name: T.name,
        kind: kind,
        ammo: T.mag,
        magSize: T.mag,
        reserve: T.reserve,
        state: "idle",
        ads: 0,
        spread: T.base,
        damage: T.damage,
        rpm: T.rpm,
        root: e,
        debug: c,
        info: n,
        update: A,
        reset: _,
        setVisible(C) {
            e.visible = !!C
        },
        muzzleWorld: y,
        reloadNow: b,
        cancelReload() {
            l.reload = null, l.reloadW = 0, l.rackW = 0
        },
        addAmmo(C) {
            w.reserve += C
        },
        setWetness() {},
        snap() {
            l.adsLin = i.input.ads ? 1 : 0;
            for (let C of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) l[C].x = 0, l[C].v = 0;
            l.sprintT = i.player.sprinting ? 1 : 0
        },
        /* v3 懒加载：模型后台加载完成后原位替换几何（保 position/rotation、火光吸附新枪口），实例引用不变 */
        dgSwapModel(nt) {
            let old = t.root;
            e.remove(old), dgDispose(old), e.add(nt.root), t = nt, n = nt.info, w.info = n, dgModels[kind] = n;
            let mz = n.muzzle;
            a.position.set(mz[0], mz[1], mz[2]);
            let wasVis = e.visible;
            e.traverse(C => {
                C.layers && C.layers.set(zc)
            }), e.visible = wasVis;
            try {
                e.updateMatrix(), e.traverse(C => {
                    C.isMesh && C.geometry && C.geometry.computeBoundingSphere && C.geometry.computeBoundingSphere()
                })
            } catch {}
        },
        dgIsPlaceholder: () => t.info && t.info.names && t.info.names[0] === "placeholder:" + kind
    };
    return _(), w
}

/* v3：占位盒体实例立即建（同步）→ 后台 dgGlb 加载 → dgSwapModel 原位替换。
   返回的 Promise 永不 reject（失败保持占位，游戏不崩）。 */
function dgBuildLazy(i, kind) {
    let T = DGTypes[kind];
    if (!T) return Promise.reject(new Error("[dg] unknown kind: " + kind));
    let w = dgAssemble(i, kind, T, dgPlaceholder(T));
    return dgModels[kind] || (dgModels[kind] = w.info), new Promise(resolve => {
        if (!T.model) return resolve(w);
        dgGlb(T.model, T.scaleLen || .3).then(t => {
            w.dgSwapModel(t)
        }).catch(n => {
            console.warn("[dg] glb load failed (" + T.model + "), keeping placeholder:", n && n.message || n)
        }).then(() => resolve(w))
    })
}

/* 旧异步工厂保留：直接等 GLB 到位再返回（失败回退占位）。boot 预建的枪用它。 */
async function dgBuild(i, kind) {
    let T = DGTypes[kind];
    if (!T) throw new Error("[dg] unknown kind: " + kind);
    let t = null;
    if (T.model) try {
        t = await dgGlb(T.model, T.scaleLen || .3)
    } catch (n) {
        console.warn("[dg] glb load failed (" + T.model + "), placeholder fallback:", n)
    }
    t || (t = dgPlaceholder(T));
    let w = dgAssemble(i, kind, T, t);
    return dgModels[kind] = t.info, w
}

/* 门面（spec §2/§3/§4/§6/§7）：双槽位 + Q 快切 + F 捡起 + G 丢弃 + 地面武器实体。
   v3：boot 只预建 pac9/deagle（既有 awp/mp5/uzi 保留预建，防行为回退）；GUNDATA 新枪懒加载——
   首次被需要（刷出地面武器/捡起/切换）时 dgEnsure：同步建盒体占位实例（接口同正式），
   后台 dgGlb 加载完成后 dgSwapModel 原位替换几何；失败保持占位，游戏不崩。
   每 kind 全场唯一（槽位+地面守恒），实例按 kind 复用、弹药随实体走。 */
async function dgn(i) {
    let inst = {
        pac9: await dm(i)
    };
    await Promise.all(["deagle", "awp", "mp5", "uzi"].map(k => dgBuild(i, k).then(w => inst[k] = w).catch(err => console.error("[dg] build failed:", k, err))));
    dgAudio(i), dgAudioV3(i);
    let slots = [{
            slot: 1,
            kind: "pac9",
            name: DGTypes.pac9.name
        }, {
            slot: 2,
            kind: "deagle",
            name: DGTypes.deagle.name
        }],
        cur = 1,
        lastSlot = 2,
        vis = !0,
        buf = 0,
        pickups = [],
        beamG = null,
        beamM = null,
        dgLoading = {};
    for (let s of slots) s.kind && !inst[s.kind] && (s.kind = null, s.name = "—");

    function kindAt(n) {
        let s = slots[n - 1];
        return s && s.kind && inst[s.kind] ? s.kind : null
    }

    /* v3（spec §7/§2）：槽位按 cat 决定——long→槽1 主武器、pistol→槽2 副武器（替换 deagle 特判） */
    function slotFor(k) {
        let T = DGTypes[k];
        return T && T.cat === "pistol" ? 2 : 1
    }

    /* v3（spec §6）：懒加载入口——kind 已在注册表、实例还没建时调用。
       同步先放盒体占位实例（保证同帧内 switchTo/pickup 拿到可用对象），
       后台 dgBuildLazy 加载完成原位替换；返回当前实例（可能是占位）。 */
    function dgEnsure(kind) {
        if (!DGTypes[kind] || inst[kind]) return inst[kind] || null;
        let w = dgAssemble(i, kind, DGTypes[kind], dgPlaceholder(DGTypes[kind]));
        inst[kind] = w, dgModels[kind] = dgModels[kind] || w.info;
        if (!dgLoading[kind]) {
            dgLoading[kind] = !0;
            dgBuildLazy(i, kind).then(full => {
                inst[kind] = full, applyVis()
            }).catch(() => {})
        }
        return w
    }

    function active() {
        let k = kindAt(cur);
        return k ? inst[k] : null
    }

    function syncSlot(s) {
        s.kind = s.kind && (inst[s.kind] || DGTypes[s.kind]) ? s.kind : null, s.name = s.kind ? DGTypes[s.kind].name : "—"
    }

    function setNoFire(v) {
        for (let k in inst) inst[k] && inst[k].debug && (inst[k].debug.noFire = v)
    }

    function applyVis() {
        let k = kindAt(cur);
        for (let kk in inst) inst[kk] && inst[kk].setVisible(vis && kk === k);
        for (let p of pickups) p.pivot.visible = vis
    }

    function click() {
        i.audio && i.audio.play && i.audio.play("pistol_click", {
            gain: .5,
            pitch: .92
        })
    }

    function switchTo(n) {
        if (n === cur || !kindAt(n)) return !1;
        lastSlot = cur, cur = n, dgEnsure(slots[n - 1].kind);
        for (let k in inst) inst[k] && inst[k].cancelReload && inst[k].cancelReload();
        return applyVis(), buf = .32, setNoFire(!0), click(), !0
    }

    function quickSwitch() {
        let t = lastSlot;
        if (t === cur || !kindAt(t)) t = cur === 1 ? 2 : 1;
        if (t === cur || !kindAt(t)) return !1;
        return switchTo(t)
    }

    function beam() {
        if (!beamG) {
            beamG = new lt.CylinderGeometry(.04, .04, 1.2, 12, 1, !1);
            let cv = document.createElement("canvas");
            cv.width = 4, cv.height = 64;
            let cx = cv.getContext("2d"),
                gr = cx.createLinearGradient(0, 0, 0, 64);
            gr.addColorStop(0, "rgba(255,179,71,0)"), gr.addColorStop(.18, "rgba(255,179,71,.5)"), gr.addColorStop(.8, "rgba(255,179,71,.34)"), gr.addColorStop(1, "rgba(255,179,71,0)"), cx.fillStyle = gr, cx.fillRect(0, 0, 4, 64);
            beamM = new lt.MeshBasicMaterial({
                map: new lt.CanvasTexture(cv),
                transparent: !0,
                blending: lt.AdditiveBlending,
                depthWrite: !1,
                side: lt.DoubleSide
            })
        }
        let m = new lt.Mesh(beamG, beamM);
        return m.position.y = .6, m
    }

    function spawnPickup(kind, x, z, mag, maxY, reserve) {
        let T = DGTypes[kind];
        if (!T) return null;
        let src = dgEnsure(kind);
        if (!src || !src.root) return null;
        let gy = 0;
        try {
            i.physics && i.physics.groundHeight && (gy = i.physics.groundHeight(x, z, maxY == null ? 1.2 : maxY))
        } catch (err) {}
        isFinite(gy) || (gy = 0);
        let pivot = new lt.Group;
        pivot.name = "pickup-" + kind, pivot.position.set(x, gy, z);
        let spin = new lt.Group;
        pivot.add(spin);
        let model = src.root.clone(!0),
            drop = [];
        model.position.set(0, 0, 0), model.rotation.set(0, 0, 0), model.visible = !0, model.traverse(o => {
            o.layers && o.layers.set(vf);
            let mm = o.material;
            o.isMesh && mm && (o.name === "dg-flash" || mm.name === "glove_fabric" || mm.uniforms && mm.uniforms.uInt || mm.type === "MeshBasicMaterial" && mm.blending === lt.AdditiveBlending) && drop.push(o)
        });
        for (let o of drop) o.parent && o.parent.remove(o);
        spin.add(model), pivot.add(beam()), i.scene.add(pivot), pivot.visible = vis, pivot.updateMatrixWorld(!0);
        let box = new lt.Box3().setFromObject(model);
        box.isEmpty() ? model.position.y = gy + .1 : (() => {
            let c = box.getCenter(new lt.Vector3);
            model.position.x = x - c.x, model.position.z = z - c.z, model.position.y += gy + .03 - box.min.y
        })();
        let rec = {
            kind: kind,
            name: T.name,
            mag: Math.max(0, Math.min(T.mag, mag | 0)),
            reserve: Math.max(0, reserve == null ? T.reserve : Math.min(T.reserve, reserve | 0)),
            pos: new lt.Vector3(x, gy, z),
            pivot: pivot,
            spin: spin
        };
        return pickups.push(rec), rec
    }

    function removePickup(p) {
        let ix = pickups.indexOf(p);
        ix >= 0 && pickups.splice(ix, 1), p.pivot.parent && p.pivot.parent.remove(p.pivot)
    }

    /* v3（spec §4）：集装箱刷枪——读 level.placed 账本（{name,x,y,z,yaw}，name 含 "container"）。
       只取最底层（y<0.05）可步行到达的点位；每点随机一把（全池=内置5款+GUNDATA，排除起手 pac9），
       满 5 弹匣，贴地 + 沿箱长轴偏移防插壁；上限 dgContainerMax 防光柱/模型常驻爆量。
       「每点随机一把」用去重洗牌：先全池洗牌再按序消费，避免 rand 连撞同 kind 静默跳点。 */
    function dgContainerSpots() {
        let placed = i.level && i.level.placed;
        if (!Array.isArray(placed)) return [];
        return placed.filter(p => p && typeof p.name == "string" && p.name.indexOf("container") >= 0 && (p.y || 0) < .05)
    }
    function dgPool(rand) {
        let pool = [];
        for (let k in DGTypes) k !== "pac9" && pool.push(k);
        if (pool.length > 1 && rand)
            for (let a = pool.length - 1; a > 0; a--) {
                let b = Math.floor(rand() * (a + 1)),
                    t = pool[a];
                pool[a] = pool[b], pool[b] = t
            }
        return pool.length ? pool : ["deagle", "awp", "mp5", "uzi"]
    }
    function dgContainerSize(name) {
        let L = name.indexOf("container40") === 0 ? 12.19 : 6.06;
        return {
            L: L,
            W: 2.44
        }
    }
    function spawnContainers(rand) {
        let spots = dgContainerSpots();
        if (!spots.length) return 0;
        rand = rand || Math.random;
        let pool = dgPool(rand),
            maxN = Math.min(spots.length, dgContainerMax);
        for (let s = 0; s < maxN; s++) {
            let p = spots[s],
                size = dgContainerSize(p.name),
                yaw = p.yaw || 0,
                ux = Math.cos(yaw),
                uz = -Math.sin(yaw),
                off = size.L * .28 * (rand() * 2 - 1),
                wx = p.x + ux * off,
                wz = p.z + uz * off,
                kind = pool[s % pool.length];
            spawnPickup(kind, wx, wz, DGTypes[kind].mag, Math.max((p.y || 0) + .1, 1.2), DGTypes[kind].reserve)
        }
        return pickups.length
    }

    function spawnInitial() {
        for (let p of pickups.slice()) i.scene.remove(p.pivot);
        pickups.length = 0, spawnPickup("awp", 8, 2, DGTypes.awp.mag), spawnPickup("mp5", -4, -12, DGTypes.mp5.mag), spawnPickup("uzi", 18, 4, DGTypes.uzi.mag),
        spawnContainers()
    }

    function nearestPickup() {
        let pp = i.player && i.player.pos;
        if (!pp) return null;
        let best = null,
            bd = 2.5;
        for (let p of pickups) {
            let d = Math.hypot(p.pos.x - pp.x, p.pos.z - pp.z),
                dy = Math.abs((p.pos.y || 0) - (pp.y || 0));
            d <= bd && dy < 2.2 && (bd = d, best = p)
        }
        return best ? {
            p: best,
            dist: bd
        } : null
    }

    function doPickup() {
        let n = nearestPickup();
        if (!n) return !1;
        let bk = n.p.kind,
            tgt = slotFor(bk),
            ts = slots[tgt - 1],
            px = n.p.pos.x,
            pz = n.p.pos.z,
            py = n.p.pos.y,
            bm = n.p.mag,
            br = n.p.reserve;
        removePickup(n.p);
        let old = ts.kind && inst[ts.kind] ? inst[ts.kind] : null;
        if (old) {
            let oldAmmo = old.ammo,
                oldRes = old.reserve;
            old.cancelReload && old.cancelReload(), old.reset && old.reset(), spawnPickup(ts.kind, px, pz, oldAmmo, py + 1, oldRes)
        }
        dgEnsure(bk), ts.kind = bk, syncSlot(ts);
        let ni = inst[bk];
        return ni && (ni.cancelReload && ni.cancelReload(), ni.reset && ni.reset(), ni.ammo = bm, ni.reserve = br), tgt !== cur ? switchTo(tgt) : (applyVis(), buf = .32, setNoFire(!0), click(), !0)
    }

    function doDrop() {
        let s = slots[cur - 1];
        if (!s.kind || !inst[s.kind]) return !1;
        let k = s.kind,
            mag = inst[k].ammo,
            res = inst[k].reserve,
            pp = i.player && i.player.pos;
        inst[k].cancelReload && inst[k].cancelReload(), inst[k].reset && inst[k].reset(), spawnPickup(k, pp ? pp.x : 0, pp ? pp.z : 0, mag, (pp ? pp.y : 0) + 1.5, res), s.kind = null, syncSlot(s);
        let other = cur === 1 ? 2 : 1;
        if (kindAt(other)) return switchTo(other);
        return applyVis(), buf = .32, setNoFire(!0), click(), !0
    }

    /* v3（spec §4）：resetAll 按 i.mode 分支——
       campaign：槽1 pac9 + 槽2 deagle + 既有 3 固定点 + 集装箱随机枪；
       rush：槽1 空、槽2 仅 deagle（5 弹匣）+ 3 固定点 + 集装箱随机枪（额外效果只有这两点归 08）。
       容器点位在 reset 重刷（deploy/retry/redeploy 都走这里，确保每次开局弹药满、点位重排）。 */
    function resetAll() {
        let mode = i.mode === "rush" ? "rush" : "campaign";
        for (let k in inst) inst[k] && inst[k].reset && inst[k].reset();
        if (mode === "rush") {
            slots[0].kind = null, syncSlot(slots[0]);
            if (!inst.deagle) dgEnsure("deagle");
            slots[1].kind = inst.deagle ? "deagle" : null, syncSlot(slots[1]);
            cur = 2, lastSlot = 1
        } else {
            slots[0].kind = inst.pac9 ? "pac9" : null, syncSlot(slots[0]);
            slots[1].kind = inst.deagle ? "deagle" : null, syncSlot(slots[1]);
            cur = 1, lastSlot = 2
        }
        buf = 0, setNoFire(!1), spawnInitial(), applyVis()
    }
    dgModels.pac9 = {
        muzzle: mi.muzzle,
        eject: mi.eject,
        names: ["pac9-procedural"],
        scaleLen: 0
    }, spawnInitial(), applyVis();
    let facade = {
        get kind() {
            return kindAt(cur)
        },
        get slot() {
            return cur
        },
        get slots() {
            return slots
        },
        get name() {
            let a = active();
            return a ? a.name : "—"
        },
        get ammo() {
            let a = active();
            return a ? a.ammo : 0
        },
        set ammo(v) {
            let a = active();
            a && (a.ammo = v)
        },
        get magSize() {
            let a = active();
            return a ? a.magSize : 0
        },
        set magSize(v) {
            let a = active();
            a && (a.magSize = v)
        },
        get reserve() {
            let a = active();
            return a ? a.reserve : 0
        },
        set reserve(v) {
            let a = active();
            a && (a.reserve = v)
        },
        get state() {
            let a = active();
            return a ? a.state : "unarmed"
        },
        set state(v) {
            let a = active();
            a && (a.state = v)
        },
        get ads() {
            let a = active();
            return a ? a.ads : 0
        },
        set ads(v) {
            let a = active();
            a && (a.ads = v)
        },
        get spread() {
            let a = active();
            return a ? a.spread : 0
        },
        set spread(v) {
            let a = active();
            a && (a.spread = v)
        },
        get damage() {
            let a = active();
            return a ? a.damage : 0
        },
        get rpm() {
            let a = active();
            return a ? a.rpm : 0
        },
        get adsFov() {
            let k = kindAt(cur);
            return k && DGTypes[k] ? DGTypes[k].adsFov : 0
        },
        get pickup() {
            let n = nearestPickup();
            return n ? {
                kind: n.p.kind,
                name: n.p.name,
                dist: n.dist
            } : null
        },
        get root() {
            let a = active();
            return a ? a.root : null
        },
        get debug() {
            let a = active();
            return a ? a.debug : null
        },
        get info() {
            let a = active();
            return a ? a.info : null
        },
        update(l) {
            let inp = i.input;
            if (inp && inp.pressed) {
                inp.pressed("weapon1") && switchTo(1);
                inp.pressed("weapon2") && switchTo(2);
                inp.pressed("lastWeapon") && quickSwitch();
                inp.pressed("pickup") && doPickup();
                inp.pressed("drop") && doDrop()
            }
            if (buf > 0) {
                buf -= l;
                buf <= 0 && setNoFire(!1)
            }
            for (let p of pickups) p.spin.rotation.y += .5 * l;
            let a = active();
            a && a.update(l)
        },
        reset: resetAll,
        setVisible(v) {
            vis = !!v, applyVis()
        },
        muzzleWorld(v) {
            let a = active();
            return a ? a.muzzleWorld(v) : v || new lt.Vector3()
        },
        reloadNow() {
            let a = active();
            return a ? a.reloadNow() : !1
        },
        cancelReload() {
            for (let k in inst) inst[k] && inst[k].cancelReload && inst[k].cancelReload()
        },
        addAmmo(v) {
            let a = active();
            a && a.addAmmo && a.addAmmo(v)
        },
        setWetness(v) {
            inst.pac9 && inst.pac9.setWetness && inst.pac9.setWetness(v)
        },
        snap() {
            let a = active();
            a && a.snap && a.snap()
        }
    };
    return window.__DG = {
        types: DGTypes,
        models: dgModels,
        get mode() {
            return i.mode === "rush" ? "rush" : "campaign"
        },
        get gundata() {
            return {
                count: dgGundataCount,
                types: dgTypeCount,
                loading: Object.keys(dgLoading),
                placeholders: Object.keys(inst).filter(k => inst[k] && inst[k].dgIsPlaceholder && inst[k].dgIsPlaceholder())
            }
        },
        get slots() {
            return slots.map(s => ({
                slot: s.slot,
                kind: s.kind,
                name: s.name
            }))
        },
        get pickups() {
            return pickups.map(p => ({
                kind: p.kind,
                name: p.name,
                mag: p.mag,
                reserve: p.reserve,
                pos: [p.pos.x, p.pos.y, p.pos.z]
            }))
        },
        get kind() {
            return kindAt(cur)
        },
        get slot() {
            return cur
        },
        get muzzle() {
            let k = kindAt(cur);
            return k && dgModels[k] ? dgModels[k].muzzle : null
        }
    }, facade
}
