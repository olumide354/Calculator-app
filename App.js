import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [fresh, setFresh] = useState(false);
  const [justEvaled, setJustEvaled] = useState(false);
  const [expr, setExpr] = useState('');
  const [activeOp, setActiveOp] = useState(null);

  function fmt(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    let s = parseFloat(n.toPrecision(10)).toString();
    if (s.length > 10) s = n.toExponential(3);
    return s;
  }

  function compute(a, b, op) {
    if (op === '+') return a + b;
    if (op === '−') return a - b;
    if (op === '×') return a * b;
    if (op === '÷') return b === 0 ? 'Error' : a / b;
    return b;
  }

  function handleDigit(val) {
    if (justEvaled) {
      setCurrent(val); setFresh(false); setJustEvaled(false); setActiveOp(null);
    } else if (current === '0' || fresh) {
      setCurrent(val); setFresh(false);
    } else if (current.length < 12) {
      setCurrent(current + val);
    }
  }

  function handleDot() {
    if (fresh || justEvaled) { setCurrent('0.'); setFresh(false); setJustEvaled(false); }
    else if (!current.includes('.')) setCurrent(current + '.');
  }

  function handleOp(op) {
    let base = current;
    if (operator && !fresh && !justEvaled) {
      const res = String(compute(parseFloat(previous), parseFloat(current), operator));
      setPrevious(res); setCurrent(res); base = res;
      fmt(res);
    } else {
      setPrevious(current);
    }
    setOperator(op); setFresh(true); setJustEvaled(false);
    setExpr(''); setActiveOp(op);
  }

  function handleEquals() {
    if (operator && previous !== null) {
      const res = compute(parseFloat(previous), parseFloat(current), operator);
      setExpr(fmt(previous) + ' ' + operator + ' ' + fmt(current) + ' =');
      setCurrent(String(res));
      setPrevious(null); setOperator(null); setFresh(true);
      setJustEvaled(true); setActiveOp(null);
    }
  }

  function handleClear() {
    setCurrent('0'); setPrevious(null); setOperator(null);
    setFresh(false); setJustEvaled(false); setExpr(''); setActiveOp(null);
  }

  function handleSign() { setCurrent(String(-parseFloat(current))); }
  function handlePct() { setCurrent(String(parseFloat(current) / 100)); }

  const showClear = current !== '0' || previous !== null;

  const rows = [
    [
      { label: showClear ? 'C' : 'AC', type: 'fn', action: handleClear },
      { label: '+/−', type: 'fn', action: handleSign },
      { label: '%', type: 'fn', action: handlePct },
      { label: '÷', type: 'op', action: () => handleOp('÷') },
    ],
    [
      { label: '7', type: 'num', action: () => handleDigit('7') },
      { label: '8', type: 'num', action: () => handleDigit('8') },
      { label: '9', type: 'num', action: () => handleDigit('9') },
      { label: '×', type: 'op', action: () => handleOp('×') },
    ],
    [
      { label: '4', type: 'num', action: () => handleDigit('4') },
      { label: '5', type: 'num', action: () => handleDigit('5') },
      { label: '6', type: 'num', action: () => handleDigit('6') },
      { label: '−', type: 'op', action: () => handleOp('−') },
    ],
    [
      { label: '1', type: 'num', action: () => handleDigit('1') },
      { label: '2', type: 'num', action: () => handleDigit('2') },
      { label: '3', type: 'num', action: () => handleDigit('3') },
      { label: '+', type: 'op', action: () => handleOp('+') },
    ],
    [
      { label: '0', type: 'zero', action: () => handleDigit('0') },
      { label: '.', type: 'num', action: handleDot },
      { label: '=', type: 'op', action: handleEquals },
    ],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.display}>
          <Text style={styles.expr} numberOfLines={1}>{expr}</Text>
          <Text style={styles.number} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.4}>
            {fmt(current)}
          </Text>
        </View>
        <View style={styles.buttons}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={[
                    styles.btn,
                    btn.type === 'fn' && styles.btnFn,
                    btn.type === 'op' && styles.btnOp,
                    btn.type === 'num' && styles.btnNum,
                    btn.type === 'zero' && styles.btnZero,
                    btn.type === 'op' && activeOp === btn.label && styles.btnOpActive,
                  ]}
                  onPress={btn.action}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.btnText,
                      btn.type === 'fn' && styles.btnTextFn,
                      btn.type === 'op' && styles.btnTextOp,
                      btn.type === 'op' && activeOp === btn.label && styles.btnTextOpActive,
                      btn.type === 'zero' && styles.btnTextZero,
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const BTN_SIZE = 78;
const OP_COLOR = '#ff9f0a';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 24 },
  display: { alignItems: 'flex-end', paddingHorizontal: 8, marginBottom: 12 },
  expr: { color: '#636366', fontSize: 20, marginBottom: 4 },
  number: { color: '#fff', fontSize: 72, fontWeight: '300' },
  buttons: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  btnFn:  { backgroundColor: '#a1a1a6' },
  btnOp:  { backgroundColor: OP_COLOR },
  btnNum: { backgroundColor: '#333336' },
  btnZero: {
    flex: 1, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    backgroundColor: '#333336', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'flex-start',
    paddingLeft: 28,
  },
  btnOpActive: { backgroundColor: '#fff' },
  btnText:        { fontSize: 28, fontWeight: '400', color: '#fff' },
  btnTextFn:      { color: '#000', fontSize: 22 },
  btnTextOp:      { color: '#fff', fontSize: 32 },
  btnTextOpActive:{ color: OP_COLOR },
  btnTextZero:    { fontSize: 28, color: '#fff' },
});
