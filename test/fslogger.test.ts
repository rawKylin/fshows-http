import LoggerClass from '../src/index'

/**
 * logger test
 */
describe('logger test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('LoggerClass is instantiable', () => {
    expect(
      new LoggerClass({
        url: 'https://event-upload.51fubei.com/common/event/synEvent/json',
        scene: 'web'
      })
    ).toBeInstanceOf(LoggerClass)
  })
})
