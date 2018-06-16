import InkSvg from 'react-svg-loader!./ink_s.svg';

const baseColor = ['#010101', '#a0a0a0'];
const colorTmpl = [
	['#F0297E'/* red */, '#12D812' /* green */],
	['#F6CB45'/* yellow */, '#9734D9' /* purple */],
	['#69D2E7'/* cyan */, '#DD417D' /* pink */],
	['#9734D9'/* purple */, '#65D344' /* green */],
	['#BFF1E5'/* white */, '#E59D0D' /* orange */],
];

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
      this.termInkInfo = {};
      this.prevColors = ['#12d812', '#f0297e'];

      this.state = {
        colors: colorTmpl[1],
        stickToTitile: false,
        colorsOfTitle: {},
        tmplIdx: 1,
      }
      props.onActive = () => {
        console.log('onActive is Called!!');
      }
    }

    onChangeColor() {
      const { term } = this.props;
      if (!term) {
        return;
      }
      console.log('focused uid: %o', this.props.uid);

      // check double click.
      this.clickCount++;
      if (this.clickCount < 2) {
        setTimeout(() => {
          this.clickCount = 0;
        }, 300);
      }
      if (this.clickCount < 2) {
        console.log('single click');
        this.prevColors = [...this.state.colors];
        const e = document.querySelectorAll("use[fill]");
        if (e) {
          e.forEach(el => {
            console.log('initialize..');
            el.removeAttribute('data-filled');
          })
        }

        const idx = this.state.tmplIdx;
        const newIdx = idx < colorTmpl.length - 1 ? idx + 1 : 0;
        this.setState({
          colors: colorTmpl[newIdx],
          tmplIdx: newIdx,
        });
      } else {
        console.log('double click');
      }
    }

    onFixColor() {
      console.log('fix selected color to uid/title');
    }

    componentDidMount() {
      console.log('props* %o', this.props.uid);
    }

    setColorByTerm(uid) {
      console.log('setColorByTerm is called.')
      const e = document.querySelectorAll("use[fill]");
      if (!e) {
        console.info('No use[fill].');
        return;
      }
      e.forEach(el => {
      	if (el.getAttribute('data-filled') == 'true') {
          console.log('data-filled is true, and retrun');
          return;
        }
        const color = el.getAttribute('fill');
      	if ( color == this.prevColors[0] || color == baseColor[0]) {
          el.setAttribute('fill', this.state.colors[0]);
          console.log('set to color-0');
        } else if ( color == this.prevColors[1] || color == baseColor[1]) {
          el.setAttribute('fill', this.state.colors[1]);
      	  console.log('set to color-1');
        } else {
          console.log('NOT match to previous color: %o', el.getAttribute('fill'));
        }
        el.setAttribute('data-filled', 'true');
      });
    }

    setColorByTitle(title) {
      return [];
    }

    componentDidUpdate() {
      if (!this.props.isTermActive) {
        return;
      }
      console.log('props: %o', this.props);
      this.setColorByTerm();
    }

    render() {
      const { uid, isTermActive, term } = this.props;
      if (isTermActive) {
        console.log('rendered: %o', this.props.uid);
        console.log('state: %o', this.state);
      }

      const children = [
        React.createElement(Term, Object.assign({}, this.props, { style: { backgroundColor: 'rgba(25,64,25,0.5)' } }))
      ];
      if (isTermActive) {
        children.unshift(<div onClick={this.onChangeColor.bind(this)}
          style={styles.img}>
          <InkSvg />
        </div>);
      }

      return <div style={{ width: '100%', height: '100%' }}>{children}</div>
    }
  };
}
