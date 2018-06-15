styles = {
    main : {
        color: "red",
        zIndex: 20,
        position: "absolute",
        bottom: "0em",
        right: "1em",
    },
    img : {
        zIndex: 20,
        position: "absolute",
        bottom: "0em",
        right: "1em",
		cursor: "pointer",
    },
    baloon : {
        zIndex: 30,
        position: "absolute",
        bottom: "180px",
		cursor: "pointer",
    },
}

exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    css: `
      ${config.css || ''}
	    `
  });
}

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
        }

        render () {
            const children = [
                <div>
                {React.createElement(Term, Object.assign({}, this.props, {style: {backgroundColor: 'rgba(25,64,25,0.5)'}}))}
                <div style={{style: styles.img}}>
                <h1>Hello</h1>
                <img src="/tmp/ink.png" onClick={()=>{}} />
                </div>
                </div>
            ];

            return <div style={{width: '100%', height: '100%', position: 'relative' }}>{children}</div>
        }
    };
}

