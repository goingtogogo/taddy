import {expect, describe, beforeEach, beforeAll, it} from '@jest/globals';

import {css, $css, mixin, $} from '..';

import {resetStyles, getStyles} from './utils';

function assertCSS(value, expectedStyles) {
    expect($css(value)).toEqual($css(expectedStyles));
}

describe('api', () => {
    beforeAll((done) => {
        // happy-dom at rules doesn't have "insertRule" method
        // TODO: raise an issue to https://github.com/capricorn86/happy-dom
        CSSMediaRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
        CSSContainerRule.prototype.insertRule =
            CSSStyleSheet.prototype.insertRule;
        // TODO: add PR with CSSSupportsRule in global
        // CSSSupportsRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;

        done();
    });

    beforeEach((done) => {
        resetStyles();

        done();
    });

    it('should generate atoms', () => {
        expect(css({color: 'red', background: 'green'})).toMatchInlineSnapshot(`
            {
              "className": "_ _1kgt43_2f0x _-m15jgy_1mpr0j ___lp7ldc",
              Symbol(ID_KEY): "___lp7ldc",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._1kgt43_2f0x { color: red; }
            ._-m15jgy_1mpr0j { background: green; }"
        `);
    });

    it('should omit only invalid values', () => {
        expect(
            css({
                color: undefined,
                opacity: 0,
                background: '',
                display: 'flex',
            }),
        ).toMatchInlineSnapshot(`
            {
              "className": "_ _-kygmid_1c _rnbphe_1vf95 ___sba9to",
              Symbol(ID_KEY): "___sba9to",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._-kygmid_1c { opacity: 0; }
            ._rnbphe_1vf95 { display: flex; }"
        `);
    });

    it('should merge mixins', () => {
        const typo = mixin({fontWeight: 'bold', fontSize: 'medium'});
        const box = mixin({display: 'flex', flexDirection: 'column'});

        assertCSS(
            {color: 'red', background: 'green', ...typo, ...box},
            {
                color: 'red',
                background: 'green',
                fontSize: 'medium',
                display: 'flex',
                flexDirection: 'column',
                fontWeight: 'bold',
            },
        );

        assertCSS(
            {
                color: 'red',
                background: 'green',
                ...typo,
                ...box,
                fontWeight: 'normal',
            },
            {
                color: 'red',
                background: 'green',
                fontSize: 'medium',
                display: 'flex',
                flexDirection: 'column',
                fontWeight: 'normal',
            },
        );

        expect(getStyles()).toMatchInlineSnapshot(`
            "._-c59cgp_1sxol { font-weight: bold; }
            ._61o3jk_-httxmz { font-size: medium; }
            ._rnbphe_1vf95 { display: flex; }
            ._-g4lbay_-memv1m { flex-direction: column; }
            ._1kgt43_2f0x { color: red; }
            ._-m15jgy_1mpr0j { background: green; }
            ._-c59cgp_-h71d09 { font-weight: normal; }"
        `);
    });

    it('should compose mixins', () => {
        const typo = mixin({fontWeight: 'bold', fontSize: 'medium'});
        const box = mixin({display: 'flex', flexDirection: 'column'});

        assertCSS(
            {
                color: 'red',
                background: 'green',
                composes: [typo, box, {padding: '10px'}],
            },
            {
                color: 'red',
                background: 'green',
                fontWeight: 'bold',
                fontSize: 'medium',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
            },
        );

        expect(getStyles()).toMatchInlineSnapshot(`
            "._-c59cgp_1sxol { font-weight: bold; }
            ._61o3jk_-httxmz { font-size: medium; }
            ._rnbphe_1vf95 { display: flex; }
            ._-g4lbay_-memv1m { flex-direction: column; }
            ._1kgt43_2f0x { color: red; }
            ._-m15jgy_1mpr0j { background: green; }
            ._-dc2nlb_wcpz { padding: 10px; }"
        `);
    });

    it('should compose mixins with pseudo', () => {
        const typo = mixin({
            fontWeight: 'bold',
            fontSize: 'medium',
            ':hover': {color: 'red'},
        });
        const box = mixin({
            display: 'flex',
            flexDirection: 'column',
            ':hover': {background: 'green'},
        });

        assertCSS(
            {color: 'red', background: 'green', composes: [typo, box]},
            {
                color: 'red',
                background: 'green',
                fontWeight: 'bold',
                fontSize: 'medium',
                display: 'flex',
                flexDirection: 'column',
                ':hover': {color: 'red', background: 'green'},
            },
        );

        expect(getStyles()).toMatchInlineSnapshot(`
            "._-c59cgp_1sxol { font-weight: bold; }
            ._61o3jk_-httxmz { font-size: medium; }
            ._t3u24i_1kgt43_2f0x:hover,._1kgt43_2f0x { color: red; }
            ._rnbphe_1vf95 { display: flex; }
            ._-g4lbay_-memv1m { flex-direction: column; }
            ._t3u24i_-m15jgy_1mpr0j:hover,._-m15jgy_1mpr0j { background: green; }"
        `);
    });

    it('should override props in composition', () => {
        const typo = mixin({fontWeight: 'bold', fontSize: 'medium'});
        const box = mixin({
            fontWeight: 'normal',
            display: 'flex',
            flexDirection: 'column',
        });

        assertCSS(
            {
                color: 'red',
                background: 'green',
                padding: '0',
                composes: [typo, box, {padding: '10px'}],
            },
            {
                color: 'red',
                background: 'green',
                fontSize: 'medium',
                display: 'flex',
                flexDirection: 'column',
                fontWeight: 'normal',
                padding: '10px',
            },
        );

        assertCSS(
            {
                color: 'red',
                background: 'green',
                fontWeight: 'initial',
                composes: [box, typo],
            },
            {
                color: 'red',
                background: 'green',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 'medium',
                fontWeight: 'bold',
            },
        );

        assertCSS(
            {
                color: 'red',
                background: 'green',
                composes: [box, typo],
                fontWeight: 'initial',
            },
            {
                color: 'red',
                background: 'green',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 'medium',
                fontWeight: 'initial',
            },
        );

        expect(getStyles()).toMatchInlineSnapshot(`
            "._-c59cgp_1sxol { font-weight: bold; }
            ._61o3jk_-httxmz { font-size: medium; }
            ._-c59cgp_-h71d09 { font-weight: normal; }
            ._rnbphe_1vf95 { display: flex; }
            ._-g4lbay_-memv1m { flex-direction: column; }
            ._1kgt43_2f0x { color: red; }
            ._-m15jgy_1mpr0j { background: green; }
            ._-dc2nlb_1c { padding: 0px; }
            ._-dc2nlb_wcpz { padding: 10px; }
            ._-c59cgp_w7zqdg { font-weight: initial; }"
        `);
    });

    it('should work with complex selectors', () => {
        const button = css({color: 'red'});
        const box = css({
            color: 'blue',
            [$` + ${button}`]: {marginLeft: '10px'},
        });

        expect(button).toMatchInlineSnapshot(`
            {
              "className": "_ _1kgt43_2f0x ___-wnp3vy",
              Symbol(ID_KEY): "___-wnp3vy",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(box).toMatchInlineSnapshot(`
            {
              "className": "_ _1kgt43_1svoa _ozbvb8_wlfys5_wcpz ___s7670w",
              Symbol(ID_KEY): "___s7670w",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._1kgt43_2f0x { color: red; }
            ._1kgt43_1svoa { color: blue; }
            ._ozbvb8_wlfys5_wcpz + .___-wnp3vy { margin-left: 10px; }"
        `);
    });

    it('should merge declarations', () => {
        const elem = css({color: 'red', background: 'blue'}, '__id1');

        expect(
            css(
                {
                    ...elem,
                    color: 'blue',
                },
                '__id2',
            ).className,
        ).toEqual(
            css(
                {
                    color: 'blue',
                    background: 'blue',
                },
                '__id1 __id2',
            ).className,
        );

        expect(
            css(
                {
                    color: 'blue',
                    ...elem,
                },
                '__id2',
            ).className,
        ).toEqual(
            css(
                {
                    color: 'red',
                    background: 'blue',
                },
                '__id1 __id2',
            ).className,
        );
    });

    it('should work with @media', () => {
        const button = css({
            color: 'blue',
            '@media': {'min-width: 100px': {color: 'red'}},
        });

        expect(button).toMatchInlineSnapshot(`
            {
              "className": "_ _1kgt43_1svoa _w0o0bo_-wl9t3s_1kgt43_2f0x ___cd9162",
              Symbol(ID_KEY): "___cd9162",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._1kgt43_1svoa { color: blue; }
            @media (min-width: 100px) { ._._w0o0bo_-wl9t3s_1kgt43_2f0x { color: red; } }"
        `);
    });

    it('should work with @container', () => {
        const button = css({
            color: 'blue',
            '@container': {'min-width: 100px': {color: 'red'}},
        });

        expect(button).toMatchInlineSnapshot(`
            {
              "className": "_ _1kgt43_1svoa _-1p9wvz_-wl9t3s_1kgt43_2f0x ___v2j7o3",
              Symbol(ID_KEY): "___v2j7o3",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._1kgt43_1svoa { color: blue; }
            @container (min-width: 100px) { ._._-1p9wvz_-wl9t3s_1kgt43_2f0x { color: red; } }"
        `);
    });

    // skipped for now, CSSSupportsRule should be available in global for prototyping
    it.skip('should work with @support', () => {
        const button = css({
            color: 'blue',
            '@supports': {'display: flex': {color: 'red'}},
        });

        expect(button).toMatchInlineSnapshot(`
            {
              "className": "_9bfd_0c8f _2ca5_7d97_9bfd_4da4 ___4d89",
              Symbol(ID_KEY): "___4d89",
              Symbol(Symbol.toPrimitive): [Function],
            }
        `);

        expect(getStyles()).toMatchInlineSnapshot(`
            "._9bfd_0c8f { color: blue; }
            @supports (display: flex) { ._2ca5_7d97_9bfd_4da4 { color: red; } }"
        `);
    });
});
