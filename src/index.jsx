import InkSvg from 'react-svg-loader!./ink_s.svg';

const colorPair = [
	['#F0297E'/* red */, '#12D812' /* green */],
	['#F6CB45'/* yellow */, '#9734D9' /* purple */],
	['#69D2E7'/* cyan */, '#DD417D' /* pink */],
	['#9734D9'/* purple */, '#65D344' /* green */],
	['#BFF1E5'/* white */, '#E59D0D' /* orange */],
];

const colorMap = {};

const styles = {
    img : {
        zIndex: 20,
        position: "fixed",
        bottom: "25px",
        right: "0px",
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

exports.middleware = store => next => (action) => {
    // TBD
    next(action);
}

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.clickCount = 0;
        }

        onChangeColor() {
            const {term} = this.props;
            console.log('clicked.');
            console.log('term: %o', term);
            console.log('uid: %o', this.props.uid);
            console.log('isFocused: %o', term.isFocused);
            console.log('sTermActive: %o', this.props.isTermActive);
            if (!term) {
                return;
            }
            console.log('focused uid: %o', this.props.uid);

            this.clickCount++;
            if (this.clickCount < 2) {
                setTimeout(() => {
                    this.clickCount = 0;
                }, 300);
            }
            if (this.clickCount < 2) {
                console.log('single click');
            } else {
                console.log('double click');
            }

            const e = document.querySelectorAll("use[fill]");
            if (!e) {
                return;
            }
            console.log("%o", e);
            e.forEach(el => {
                el.setAttribute('fill', '#5555FF');
            });
        }

        onFixColor() {
            console.log('fix selected color to uid/title');
        }

      componentDidMount() {
          /*
        const e = document.querySelectorAll("use[fill]");
        console.log("%o", e);
          e.forEach(el => {
              el.setAttribute('fill', '#5555FF');
          });
          */
      }
        render () {
            console.log('props* %o', this.props);
			console.log('uid: %o', this.props.uid);
            console.log('sTermActive: %o', this.props.isTermActive);
            if (this.props.term) {
			       console.log('title: %o', this.props.term.title);
                     console.log('isFocused: %o', this.props.term.isFocused);
            }
            const children = [
                React.createElement(Term, Object.assign({}, this.props, {style: {backgroundColor: 'rgba(25,64,25,0.5)'}}))
            ];
            if (this.props.isTermActive) {
                children.unshift(<div onClick={this.onChangeColor.bind(this)} 
                    style={styles.img}>
                    <InkSvg />
                </div>);
            }

            return <div style={{width: '100%', height: '100%'}}>{children}</div>
        }
    };
}
