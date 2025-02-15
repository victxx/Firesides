export async function readNfc() {
  if ('NDEFReader' in window) {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.onreading = event => {
        console.log('NFC message read:', event.message);
        event.message.records.forEach(record => {
          console.log('Record type:', record.recordType);
          // Process each record as needed
        });
      };
      console.log('NFC scanning started successfully.');
    } catch (error) {
      console.error('Error reading NFC:', error);
    }
  } else {
    console.error('Web NFC is not supported on this browser.');
  }
}

export async function writeNfc(data) {
  if ('NDEFReader' in window) {
    try {
      const ndef = new NDEFReader();
      await ndef.write(data);
      console.log('NFC message written successfully.');
    } catch (error) {
      console.error('Error writing NFC:', error);
    }
  } else {
    console.error('Web NFC is not supported on this browser.');
  }
} 