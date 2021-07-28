import json
import miniamf
import zlib


def main():
    with open('shzStars.dat', mode='rb') as data, \
            open('shzStars.js', mode='w') as export, \
            open('shzStars.pretty.js', mode='w') as pretty_print:
        decompressed_data = zlib.decompress(data.read())
        parsed_data = list(miniamf.decode(decompressed_data))[0]
        for star in parsed_data:
            star['dataTable'] = []
            star['rawDataTable'].seek(0)
            num_entries = star['rawDataTable'].remaining() / 20
            if not num_entries % 20:
                raise Exception(
                    'The number of bytes in the raw data table must be a multiple of 20')

            star['maxMass'] = float('-inf')
            star['minMass'] = float('inf')
            star['maxLogLum'] = float('-inf')
            star['minLogLum'] = float('inf')
            star['maxLogRadius'] = float('-inf')
            star['minLogRadius'] = float('inf')

            for _ in range(int(num_entries)):
                time = star['rawDataTable'].readFloat()
                mass = star['rawDataTable'].readFloat()
                logLum = star['rawDataTable'].readFloat()
                logRadius = star['rawDataTable'].readFloat()
                logTemp = star['rawDataTable'].readFloat()

                star['dataTable'].append({
                    'time': time,
                    'mass': mass,
                    'logLum': logLum,
                    'logRadius': logRadius,
                    'logTemp': logTemp,
                    # These attributes are in the orginal. They hold
                    # auxiliary data that gets computed as the sim
                    # is updated. Leaving these out of the export
                    # to save space
                    # 'shzInner': 1,
                    # 'shzOuter': 1,
                    # 'shzTemp': 1,
                    # 'distance': 1
                })

                star['maxMass'] = max(star['maxMass'], mass)
                star['minMass'] = min(star['minMass'], mass)
                star['maxLogLum'] = max(star['maxLogLum'], logLum)
                star['minLogLum'] = min(star['minLogLum'], logLum)
                star['maxLogRadius'] = max(star['maxLogRadius'], logRadius)
                star['minLogRadius'] = min(star['minLogRadius'], logRadius)

            del star['rawDataTable']

        export.write('export default const shzStarData = ')
        export.write(json.dumps(parsed_data))
        pretty_print.write('export default const shzStarData = ')
        pretty_print.write(json.dumps(parsed_data, indent=4))


if __name__ == "__main__":
    main()
