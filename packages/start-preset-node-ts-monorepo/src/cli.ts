import Reporter from '@start/reporter-verbose'
import * as tasks from './'

const taskName = process.argv[2]
const task = tasks[taskName]

if (typeof taskName === 'undefined' || typeof task === 'undefined') {
  throw `One of the following task names is required:\n* ${Object.keys(tasks).join('\n* ')}`
}

(async () => {
  try {
    const reporter = Reporter(taskName)
    const taskArgs = process.argv.slice(3)
    const taskRunner = await task(...taskArgs)

    await taskRunner(reporter)()
  } catch (error) {
    if (error !== null) {
      console.log(error)
    }

    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
})()
