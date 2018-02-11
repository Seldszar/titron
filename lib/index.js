const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const throttle = require('p-throttle');
const nanoid = require('nanoid');
const tmi = require('tmi.js');
const XRegExp = require('xregexp');
const { createLogger } = require('./logger');

async function createApplication({ config }) {
  const pattern = XRegExp.union(config.keywords, 'gi');
  const logger = createLogger();

  const adapter = new FileAsync('data/db.json', { defaultValue: [] });
  const db = await low(adapter);

  const client = new tmi.Client({
    connection: {
      reconnect: true,
    },
    identity: {
      username: config.username,
      password: config.password,
    },
  });

  const processRequest = async (request) => {
    logger.debug('Processing request "%s"...', request.id, {
      request,
    });

    try {
      if (await client.unban(config.channel, request.username)) {
        logger.info(`User "${request.username}" is now unbanned from the channel.`, {
          request,
        });

        await db.find({ id: request.id })
          .assign({ completedAt: new Date() })
          .write();
      }
    } catch (error) {
      logger.error(`An error occured during the request processing: ${error.message}`, {
        error, request,
      });
    }
  };

  const throttled = throttle(processRequest, 100 * 0.95, 30000);

  client.on('connected', () => {
    logger.info('Client is connected.');
  });

  client.on('whisper', async (from, userstate, message, self) => {
    if (self) {
      return;
    }

    if (pattern.test(message)) {
      const request = {
        id: nanoid(),
        username: userstate.username,
        receivedAt: new Date(),
        completedAt: null,
      };

      logger.debug('Request received from user "%s".', request.username, {
        request,
      });

      if (db.some({ username: request.username }).value()) {
        logger.debug('A request already exists for the user "%s".', request.username, {
          request,
        });

        return;
      }

      await db.push(request)
        .write();

      throttled(request);
    }
  });

  for (const request of db.filter({ completedAt: null }).value()) {
    throttled(request);
  }

  return {
    /**
     * Start the application.
     */
    async start() {
      logger.info('Starting application...');

      await client.connect();
    },

    /**
     * Close the application.
     */
    async close() {
      logger.info('Closing application...');

      await throttled.abort();
      await client.disconnect();
    },
  };
}

exports.createApplication = createApplication;
