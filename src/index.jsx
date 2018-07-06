import OkInk from 'react-svg-loader!./ok.svg';
import { ChromePicker, CirclePicker } from 'react-color';
const path = require('path');
let inkCommand = 'ink-badge';

let baseColors = ['#010101', '#a0a0a0'];
let colorTmpl = [
  ['#f0297e' /* red */, '#12d812' /* green */],
  ['#f6cb45' /* yellow */, '#9734d9' /* purple */],
  ['#69d2e7' /* cyan */, '#dd417d' /* pink */],
  ['#9734d9' /* purple */, '#65d344' /* green */],
  ['#bff1e5' /* white */, '#e59d0d' /* orange */],
];

// below detection command reffered from hyper-power
const detectCommand = cmd => data => {
  const patterns = [
    `command not found: ${cmd} (.+)`, //zsh
    `${cmd} (.+): command not found`, // bash
    `${cmd} (.+): Command not found.`, // csh
    `Unknown command '${cmd} (.+)'`, // ?
    `'${cmd} (.+)' is not recognized.*`, // ?
  ];
  const patternNum = patterns.length;
  const reg = new RegExp(patterns.join('|'));
  const matched = data.match(reg);
  if (!matched || matched.length <= 1) {
    return null;
  }
  return matched.slice(1, patternNum).find(e => e); // return not null.
};

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
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 21,
    width: '680px',
    left: 'calc(50% - 680px/2)',
    top: '50px',
    borderRadius: '16px 16px 16px 16px / 16px 16px 16px 16px',
    backgroundImage:
      'linear-gradient( -45deg, #f5eeed 25%, #f4e2de 25%, #f4e2de 50%, #f5eeed 50%, #f5eeed 75%, #f4e2de 75%, #f4e2de )',
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
  inkText: {
    fontFamily: 'Paintball',
    color: 'grey',
    zIndex: 19,
    position: 'fixed',
    bottom: '36px',
    right: '100px',
  },
  okButton: {
    marginTop: '1.5em',
    marginRight: '4em',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  pickerLabel: {
    paddingBottom: '0.5em',
    textShadow: `1px 1px 0 #000,
             -1px 1px 0 #000,
             1px -1px 0 #000,
             -1px -1px 0 #000`,
    fontFamily: 'Paintball',
  },
};

exports.decorateConfig = config => {
  const pluginConfig = config.hyperInkBadge;
  // TBD: validate config.

  let fontSrc = 'file://' + path.join(__dirname, 'fonts', 'paintball_web.woff');
  if (pluginConfig && pluginConfig.fontPath) {
    fontSrc = pluginConfig.fontPath;
  }

  return Object.assign({}, config, {
    css: `
    ${config.css || ''}
    @font-face {
      font-family: Paintball;
      font-weight: bold;
      src: url("${fontSrc}");
    }`,
  });
};

const getColorPair = str => {
  const colors = str.replace(/\s+/g, '').split(',');
  if (colors.length !== 2) {
    return null;
  }
  if (
    colors.every(c =>
      /^#[0-9,abcdefABCDEF]{6}$|^#[0-9abcdefABCDEF]{3}$/.test(c)
    )
  ) {
    return colors;
  }
  return null;
};

exports.middleware = store => next => action => {
  const regExp = new RegExp('^' + inkCommand + '\\s+(.+)');
  if (action.type === 'SESSION_ADD_DATA') {
    const command = detectCommand(inkCommand)(action.data);
    if (!command) {
      next(action);
      return;
    }
    const colorPair = getColorPair(command);
    if (colorPair) {
      store.dispatch({
        type: 'UPDATE_COLOR',
        payload: colorPair,
      });
    } else {
      store.dispatch({
        type: 'UPDATE_TEXT',
        payload: command,
      });
    }
    return; // surpress show shell error message..
  }
  next(action);
};

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'UPDATE_COLOR':
      return state.set('colorState', action.payload.map(e => e.toLowerCase()));
    case 'UPDATE_TEXT':
      return state.set('textState', action.payload);
    default:
      return state;
  }
};

exports.mapTermsState = (state, map) =>
  Object.assign(map, {
    colorState: state.ui.colorState,
    textState: state.ui.textState,
  });
const passProps = (uid, parentProps, props) =>
  Object.assign(props, {
    colorState: parentProps.colorState,
    textState: parentProps.textState,
  });
exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.termInkInfo = {};
      this.prevColors = [...colorTmpl[0]];
      this.colorsOfTitle = {};
      this.prevTitle = '';

      this.state = {
        text: '',
        colors: colorTmpl[0],
        tmplIdx: 0,
        showPicker: false,
      };

      const config = window.config.getConfig().hyperInktoon;
      if (config && config.baseColors) {
        baseColors = [
          config.baseColors[0].toLowerCase(),
          config.baseColors[1].toLowerCase(),
        ];
      }
      if (config && config.templateColors) {
        colorTmpl = config.templateColors.map(colors => {
          return [colors[0].toLowerCase(), colors[1].toLowerCase()];
        });
      }
    }
    requireRepaint() {
      const inkObj = document.querySelector('#inktoon-object');
      const e = inkObj.contentDocument.querySelectorAll('use[fill]');
      // const e = document.querySelectorAll('use[fill]');
      if (e) {
        e.forEach(el => {
          el.removeAttribute('data-filled');
        });
      }
    }

    changeColorByTmpl() {
      this.requireRepaint();
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
        return;
      }
      const { title } = term;
      if (!this.colorsOfTitle[title]) {
        // fix to title
        notify('hyper-inktoon', `Ink color is sticky to ${title}`);
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

      if (event.shiftKey) {
        this.fixColorToTitle();
      } else if (event.metaKey) {
        this.setState({ showPicker: true });
      } else {
        this.changeColorByTmpl();
      }
    }

    componentDidMount() {
      const config = window.config.getConfig().hyperInktoon;
      if (!config) {
        return;
      }
      if (config.command) {
        inkCommand = config.command;
      }
      if (config.advancedPicker) {
        this.advancedPicker = true;
      }
    }

    setInkColor({ from, to }) {
      const inkObj = document.querySelector('#inktoon-object');
      if (!inkObj.contentDocument) {
        // Object is not loaded yet.
        return;
      }
      const e = inkObj.contentDocument.querySelectorAll('use[fill]');
      if (!e || e.length < 1) {
        return;
      }
      e.forEach(el => {
        if (el.getAttribute('data-filled') == 'true') {
          return;
        }
        const color = el.getAttribute('fill');
        if (color == from[0] || color == baseColors[0]) {
          el.setAttribute('fill', to[0]);
        } else if (color == from[1] || color == baseColors[1]) {
          el.setAttribute('fill', to[1]);
        } else {
          console.error(
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
      if (!nextProps.isTermActive) {
        return;
      }

      const title = nextProps.term ? nextProps.term.title : null;
      if (title && this.colorsOfTitle[title]) {
        if (!this.isSameColor(this.state.colors, this.colorsOfTitle[title])) {
          this.prevColors = [...this.state.colors];
          this.setState({
            colors: this.colorsOfTitle[title],
          });
        }
      } else if (this.colorsOfTitle[this.prevTitle]) {
        this.prevColors = [...this.state.colors];
        this.setState({ colors: colorTmpl[this.state.tmplIdx] });
      }

      if (this.props.colorState !== nextProps.colorState) {
        this.requireRepaint();
        this.prevColors = [...this.state.colors];
        this.setState({ colors: nextProps.colorState });
      }
      if (this.props.textState !== nextProps.textState) {
        if (nextProps.textState === '-') {
          this.setState({ text: '' });
        } else {
          this.setState({ text: nextProps.textState });
        }
      }
    }

    componentDidUpdate() {
      if (!this.props.isTermActive) {
        return;
      }
      const { title } = this.props.term;
      if (
        (this.colorsOfTitle[title] && title != this.prevTitle) ||
        (this.colorsOfTitle[this.prevTitle] && title != this.prevTitle)
      ) {
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
        this.requireRepaint();
        this.setState({
          colors: newColors,
        });
      };
    }

    onLoadObject() {
      this.setInkColor({
        from: this.prevColors,
        to: this.state.colors,
      });

      const inkObj = document.querySelector('#inktoon-object');
      const svg = inkObj.contentDocument.querySelector('svg');
      svg.addEventListener('click', this.onChangeColor.bind(this));
      svg.setAttribute('style', 'cursor: pointer');
    }

    render() {
      const { uid, isTermActive, term } = this.props;
      if (!isTermActive) {
        return null;
      }
      const config = window.config.getConfig().hyperInktoon;
      const imagePath =
        config && config.imagePath
          ? config.imagePath
          : 'file://' + path.join(__dirname, 'images', 'ink.svg');

      const pickers =
        this.advancedPicker === true
          ? [0, 1].map(idx => (
              <div>
                <h1
                  style={{
                    ...styles.pickerLabel,
                    color: this.state.colors[idx],
                  }}
                >{`Color${idx + 1}`}</h1>
                <ChromePicker
                  key={`color${idx}`}
                  disableAlpha={true}
                  color={this.state.colors[idx]}
                  onChangeComplete={this.selectColor(idx).bind(this)}
                />
              </div>
            ))
          : [0, 1].map(idx => (
              <div>
                <h1
                  style={{
                    ...styles.pickerLabel,
                    color: this.state.colors[idx],
                  }}
                >{`Color${idx + 1}`}</h1>
                <CirclePicker
                  key={`color${idx}`}
                  color={this.state.colors[idx]}
                  onChangeComplete={this.selectColor(idx).bind(this)}
                />
              </div>
            ));

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
            <div style={styles.dialogContainer}>
              <div style={styles.pickerContainer}>{pickers}</div>
              <OkInk
                onClick={a => this.setState({ showPicker: false })}
                style={styles.okButton}
              />
            </div>
          );
        }

        children.unshift(
          <div style={styles.img} onClick={this.onChangeColor.bind(this)}>
            <h1 style={styles.inkText}>{this.state.text}</h1>
            <object
              onLoad={this.onLoadObject.bind(this)}
              id="inktoon-object"
              type="image/svg+xml"
              data={imagePath}
            />
          </div>
        );
      }
      return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
    }
  };
};
