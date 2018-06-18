import InkSvg from 'react-svg-loader!./ink_s.svg';

const baseColor = ['#010101', '#a0a0a0'];
const colorTmpl = [
  ['#f0297e' /* red */, '#12d812' /* green */],
  ['#f6cb45' /* yellow */, '#9734d9' /* purple */],
  ['#69d2e7' /* cyan */, '#dd417d' /* pink */],
  ['#9734d9' /* purple */, '#65d344' /* green */],
  ['#bff1e5' /* white */, '#e59d0d' /* orange */],
];
const doubleClickPeriod = 300; //msec

const styles = {
  img: {
    zIndex: 20,
    position: 'fixed',
    bottom: '25px',
    right: '0px',
    cursor: 'pointer',
  },
};

exports.decorateConfig = config => {
  return Object.assign({}, config, {
    css: `
      ${config.css || ''}
	    `,
  });
};

exports.middleware = store => next => action => {
  // TBD
  next(action);
};

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.termInkInfo = {};
      this.prevColors = [...colorTmpl[0]];
      this.colorsOfTitle = {};
      this.prevTitle = '';

      this.state = {
        colors: colorTmpl[0],
        tmplIdx: 0,
      };
      props.onActive = () => {
        console.log('onActive is Called!!');
      };
    }

    requireRepaint() {
      const e = document.querySelectorAll('use[fill]');
      if (e) {
        e.forEach(el => {
          el.removeAttribute('data-filled');
        });
      }
    }

    changeColorByTmpl() {
      this.requireRepaint();
      console.log('set prevColors to %o', this.state.colors);
      // this.prevColors = [...this.state.colors];
      const idx = this.state.tmplIdx;
      const newIdx = idx < colorTmpl.length - 1 ? idx + 1 : 0;
      this.prevColors = [...this.state.colors];
      this.setState({
        colors: colorTmpl[newIdx],
        tmplIdx: newIdx,
      });
    }

    fixColorToTitle() {
      const { term } = this.props;
      if (!term) {
        console.error('term is undefined.');
        return;
      }
      const { title } = term;
      if (!this.colorsOfTitle[title]) {
        // fix to title
        notify(`Ink is sticky to ${title}`, 'this is a body');
        // console.log(`setPrevColors:%o`, this.state.colors);
        // this.prevColors = [...this.state.colors];
        this.colorsOfTitle[title] = [...this.state.colors];
      } else {
        // unfix to title
        delete this.colorsOfTitle[title];
      }
    }

    onChangeColor(event) {
      const { term } = this.props;
      if (!term) {
        return;
      }
      console.log('%o', event);

      if (event.shiftKey) {
          this.fixColorToTitle();
      } else {
          this.changeColorByTmpl();
      }
    }

    componentDidMount() {
      console.log('props* %o', this.props.uid);
    }

    setInkColor({ from, to }) {
      console.log('setInkColor is called.');

      const e = document.querySelectorAll('use[fill]');
      if (!e) {
        console.info('No use[fill].');
        return;
      }
      e.forEach(el => {
        if (el.getAttribute('data-filled') == 'true') {
          return;
        }
        const color = el.getAttribute('fill');
        if (color == from[0] || color == baseColor[0]) {
          el.setAttribute('fill', to[0]);
          console.log('set to color-0');
        } else if (color == from[1] || color == baseColor[1]) {
          el.setAttribute('fill', to[1]);
          console.log('set to color-1');
        } else {
          console.log(
            'NOT match to previous color: find: %o, from: %o, %o',
            color,
            from[0],
            from[1]
          );
        }
        el.setAttribute('data-filled', 'true');
      });
    }

    isSameColor(color1, color2) {
      return color1[0] == color2[0] && color1[1] == color2[1];
    }

    componentWillReceiveProps(nextProps) {
      const title = nextProps.term ? nextProps.term.title : null;
      console.log('TITLE is %o', title);
      if (title && this.colorsOfTitle[title]) {
        if (this.isSameColor(this.state.colors, this.colorsOfTitle[title])) {
          return;
        }
        console.log('set color by title(%o)', title);
        this.prevColors = [...this.state.colors];
        this.setState({
          colors: this.colorsOfTitle[title],
        });
      } else if (this.colorsOfTitle[this.prevTitle]) {
        console.log('revert color by title(%o)', this.prevTitle);
        this.prevColors = [...this.state.colors];
        this.setState({ colors: colorTmpl[this.state.tmplIdx] });
      }
    }

    componentDidUpdate() {
      if (!this.props.isTermActive) {
        return;
      }
      console.log('componentDidUpdate(), props: %o', this.props);
      const { title } = this.props.term;
      console.log(`title: ${title}(old: ${this.prevTitle})`);

      if (
        (this.colorsOfTitle[title] && title != this.prevTitle) ||
        (this.colorsOfTitle[this.prevTitle] && title != this.prevTitle)
      ) {
        console.log('Repaint is required.');
        this.requireRepaint();
      }
      this.setInkColor({ from: this.prevColors, to: this.state.colors });
      this.prevTitle = title;
    }

    render() {
      const { uid, isTermActive, term } = this.props;
      if (isTermActive) {
        console.log('rendered: %o', this.props.uid);
      }

      const children = [
        React.createElement(
          Term,
          Object.assign({}, this.props, {
            style: { backgroundColor: 'rgba(25,64,25,0.5)' },
          })
        ),
      ];
      if (isTermActive) {
        children.unshift(
          <div onClick={this.onChangeColor.bind(this)} style={styles.img}>
            <InkSvg />
          </div>
        );
      }
      return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
    }
  };
};
