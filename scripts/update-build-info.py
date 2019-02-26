#!/usr/bin/env python3
#
# Update a sim's version and build info in its index.html
# based on info from its package.json file.
#

import json
import sys
from datetime import date
from os.path import join
from bs4 import BeautifulSoup


def format_build_info(name, version, date):
    return '{} {} (build date: {})'.format(
        name, version, date)


def get_package_data(directory):
    with open(join(directory, 'package.json')) as f:
        package_json = f.read()

    return json.loads(package_json)


def update_package_info(directory, name, version):
    with open(join(directory, 'index.html')) as f:
        index_html = f.read()

    soup = BeautifulSoup(index_html, 'html.parser')
    el = soup.find('p', class_='sim-version')

    if el:
        build_info = format_build_info(name, version, date.today())
        print(build_info)

        el.string = build_info

        with open(join(directory, 'index.html'), 'w') as f:
            f.write(soup.prettify())

        print('Wrote to {}'.format(join(directory, 'index.html')))


def main():
    if len(sys.argv) < 2:
        directory = '.'
        print('update-build-info: Using current directory')
    else:
        directory = sys.argv[1]
        print('update-build-info {}'.format(directory))

    package_data = get_package_data(directory)

    name = package_data.get('name')
    version = package_data.get('version')

    update_package_info(directory, name, version)


if __name__ == '__main__':
    main()
