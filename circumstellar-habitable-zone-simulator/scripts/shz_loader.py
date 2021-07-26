import json
import miniamf
import zlib


def main():
    with open('shzStars.dat', mode='rb') as data, open('shzStars.js', mode='w') as export:
        decompressed_data = zlib.decompress(data.read())
        parsed_data = list(miniamf.decode(decompressed_data))[0]
        for el in parsed_data:
            del el['rawDataTable']
        export.write(json.dumps(parsed_data))


if __name__ == "__main__":
    main()
