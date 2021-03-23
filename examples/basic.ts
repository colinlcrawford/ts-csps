import * as ch from '../src/channel';

interface DTO {
  info: string;
}

async function main() {
  // create an unbuffered channel
  const c = ch.create<DTO>();

  // send blocks because the channel is unbuffered
  (async () => {
    const dto = { info: 'func 1' };
    await ch.send(c)(dto);
    console.log('finished func 1');
  })();

  (async () => {
    const dto = { info: 'func 2' };
    await ch.send(c)(dto);
    console.log('finished func 2');
  })();

  const dto1 = await ch.receive(c);
  const dto2 = await ch.receive(c);

  console.log('dto1');
  console.table(dto1);
  console.log('dto2');
  console.table(dto2);
}

main();
