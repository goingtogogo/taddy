import * as React from 'react';

import {css} from 'taddy';

const styles = {
    base: css({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        whiteSpace: 'pre',
        zIndex: 5,
        padding: '20px',
        fontSize: '17px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    }),
    _variant: {
        compiling: css({
            background: 'rgb(255 255 255 / 95%)',
            textAlign: 'center',
            color: 'black',
        }),
        error: css({
            background: 'rgb(2 10 10 / 80%)',
            textAlign: 'left',
            color: 'white',
        }),
    },
    _animated: (visible: boolean) =>
        css(
            {
                transitionProperty: 'opacity',
                transitionDuration: '300ms',
            },
            visible ? {opacity: 1} : {opacity: 0},
        ),
};

export const EditorLayer = ({
    children,
    variant,
}: {
    children?: React.ReactNode;
    variant?: keyof typeof styles._variant;
}) => {
    return (
        <code
            {...css(
                styles.base,
                variant && styles._variant[variant],
                styles._animated(!!variant),
            )}
        >
            {children}
        </code>
    );
};
