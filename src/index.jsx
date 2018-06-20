import InkSvg from 'react-svg-loader!./ink_s.svg';
import OkInk from 'react-svg-loader!./okink.svg';
import {ChromePicker, CirclePicker} from 'react-color';
const path = require('path');

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
  picker: {
    zIndex: 20,
    position: 'fixed',
    bottom: '45px',
    right: '10px',
    cursor: 'pointer',
  },
  pickerContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  dialogContainer: {
    position: 'fixed',
    zIndex: 21,
    width: '680px',
    left: 'calc(50% - 680px/2)',
    top: '50px',
      borderRadius: '16px 16px 16px 16px / 16px 16px 16px 16px',
      backgroundImage: 'linear-gradient( -45deg, #f5eeed 25%, #f4e2de 25%, #f4e2de 50%, #f5eeed 50%, #f5eeed 75%, #f4e2de 75%, #f4e2de )',
      backgroundSize: '30px 30px',
      padding: '2em',
  },
  img: {
    zIndex: 20,
    position: 'fixed',
    bottom: '25px',
    right: '0px',
    cursor: 'pointer',
  },
};

exports.decorateConfig = config => {
  const fontPath = path.join(__dirname, 'paintball_web.woff');
  console.error(`here is ${fontPath}`);
  return Object.assign({}, config, {
    // ${config.css || ''}
    css: `
    ${config.css || ''}
    @font-face {
      font-family: Paintball;
      font-weight: bold;
      src: url(http://fizzystack.web.fc2.com/paintball_web.woff);
    }
    .inktypo {
      color: red;
      font-family: Paintball;
    }`,
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
        showPicker: true,
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
      } else if (event.metaKey) {
        this.setState({showPicker: true});
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

    selectColor(idx) {
      return (color, event) => {
        this.prevColors[idx] = this.state.colors[idx];
        const newColors = [...this.state.colors];
        newColors[idx] = color.hex;
        console.log('COLOR PICKER IS CALLED: %o', color.hex);
        this.requireRepaint();
        this.setState({
          colors: newColors,
        });
      }
  }

    render() {
      const { uid, isTermActive, term } = this.props;
      if (isTermActive) {
        console.log('rendered: %o', this.props.uid);
      }

      /*
      const pickers = (<div style={styles.pickerContainer}>
              <ChromePicker key='color1' disableAlpha={true} color={this.state.colors[0]} onChangeComplete={this.selectColor(0).bind(this)} />
              <ChromePicker key='color2' disableAlpha={true} color={this.state.colors[1]} onChangeComplete={this.selectColor(1).bind(this)} />
            </div>);
            */

      const pickers = (<div style={styles.pickerContainer}>
              <CirclePicker key='color1' color={this.state.colors[0]} onChangeComplete={this.selectColor(0).bind(this)} />
              <CirclePicker key='color2' color={this.state.colors[1]} onChangeComplete={this.selectColor(1).bind(this)} />
            </div>);

      const children = [
        React.createElement(
          Term,
          Object.assign({}, this.props, {
            style: { backgroundColor: 'rgba(25,64,25,0.5)' },
          })
        ),
      ];
      if (isTermActive) {

        if (this.state.showPicker) {
          children.unshift(
            <div style={styles.dialogContainer} >
              {pickers}
              <OkInk onClick={a => this.setState({showPicker: false})} style={{ cursor: 'pointer' }} />
            </div>
          );
      }

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
